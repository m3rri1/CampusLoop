-- Lost & Found image storage
-- Public bucket so report images can be displayed on listing cards.
insert into storage.buckets (id, name, public)
values ('lost-found', 'lost-found', true)
on conflict (id) do update set public = true;

-- Users can upload images into their own user-id folder.
create policy "Authenticated users can upload lost found images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'lost-found'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can replace/delete images from their own folder.
create policy "Users can update their lost found images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'lost-found'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'lost-found'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their lost found images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'lost-found'
  and (storage.foldername(name))[1] = auth.uid()::text
);