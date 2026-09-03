-- Lost & Found reports
create table public.lost_found_reports (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  description text not null,
  type text not null check (type in ('lost', 'found')),
  category text not null,

  location text not null,
  specific_area text,
  date_reported date not null,
  approximate_time text,

  image_url text,
  status text not null default 'active'
    check (status in ('active', 'claimed', 'returned')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Claim requests
create table public.lost_found_claims (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.lost_found_reports(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,

  identifying_details text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (report_id, claimant_id)
);

-- QR verification records
create table public.lost_found_verifications (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.lost_found_reports(id) on delete cascade,
  claim_id uuid not null references public.lost_found_claims(id) on delete cascade,

  verification_code text not null unique,
  reporter_confirmed boolean not null default false,
  claimant_confirmed boolean not null default false,
  verified_at timestamptz,

  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.lost_found_reports enable row level security;
alter table public.lost_found_claims enable row level security;
alter table public.lost_found_verifications enable row level security;

-- Reports: everyone logged in can browse active reports
create policy "Authenticated users can view lost found reports"
on public.lost_found_reports
for select
to authenticated
using (true);

-- Users can create their own reports
create policy "Users can create their own reports"
on public.lost_found_reports
for insert
to authenticated
with check (auth.uid() = reported_by);

-- Users can update their own reports
create policy "Users can update their own reports"
on public.lost_found_reports
for update
to authenticated
using (auth.uid() = reported_by)
with check (auth.uid() = reported_by);

-- Users can delete their own reports
create policy "Users can delete their own reports"
on public.lost_found_reports
for delete
to authenticated
using (auth.uid() = reported_by);

-- Claimants can view their own claims
create policy "Users can view their own claims"
on public.lost_found_claims
for select
to authenticated
using (auth.uid() = claimant_id);

-- Report owners can view claims on their reports
create policy "Report owners can view claims"
on public.lost_found_claims
for select
to authenticated
using (
  exists (
    select 1
    from public.lost_found_reports
    where lost_found_reports.id = lost_found_claims.report_id
      and lost_found_reports.reported_by = auth.uid()
  )
);

-- Users can create claims for themselves
create policy "Users can create their own claims"
on public.lost_found_claims
for insert
to authenticated
with check (auth.uid() = claimant_id);

-- Claimants can update their own claims
create policy "Claimants can update their own claims"
on public.lost_found_claims
for update
to authenticated
using (auth.uid() = claimant_id)
with check (auth.uid() = claimant_id);

-- Users involved in a claim can view its verification
create policy "Users can view their verification"
on public.lost_found_verifications
for select
to authenticated
using (
  exists (
    select 1
    from public.lost_found_claims c
    join public.lost_found_reports r
      on r.id = c.report_id
    where c.id = lost_found_verifications.claim_id
      and (
        c.claimant_id = auth.uid()
        or r.reported_by = auth.uid()
      )
  )
);

-- Report owner can create verification
create policy "Report owners can create verification"
on public.lost_found_verifications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.lost_found_reports
    where lost_found_reports.id = report_id
      and lost_found_reports.reported_by = auth.uid()
  )
);

-- Participants can update verification
create policy "Users can update their verification"
on public.lost_found_verifications
for update
to authenticated
using (
  exists (
    select 1
    from public.lost_found_claims c
    join public.lost_found_reports r
      on r.id = c.report_id
    where c.id = lost_found_verifications.claim_id
      and (
        c.claimant_id = auth.uid()
        or r.reported_by = auth.uid()
      )
  )
)
with check (
  exists (
    select 1
    from public.lost_found_claims c
    join public.lost_found_reports r
      on r.id = c.report_id
    where c.id = lost_found_verifications.claim_id
      and (
        c.claimant_id = auth.uid()
        or r.reported_by = auth.uid()
      )
  )
);