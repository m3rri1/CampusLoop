-- Allow Lost & Found listings to be browsed without signing in.
-- Reporting/claiming still requires authentication through the existing policies.
create policy "Anyone can view lost found reports"
on public.lost_found_reports
for select
to anon
using (true);
