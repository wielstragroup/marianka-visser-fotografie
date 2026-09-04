-- Storage bucket for the photo library. Public-read (photos are meant to be
-- shown on the public site), writes restricted to admins.
--
-- file_size_limit / allowed_mime_types are enforced by Supabase Storage
-- itself, independent of the app's own client-side checks (uploads go
-- straight from the browser to Storage, so these are the actual backstop —
-- see src/app/admin/(dashboard)/media/actions.ts for why the upload
-- doesn't route through a Next.js server function).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800, -- 50MB, matches MAX_FILE_SIZE in src/lib/media.ts
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media_bucket_public_read"
on storage.objects for select
using (bucket_id = 'media');

create policy "media_bucket_admin_insert"
on storage.objects for insert
with check (bucket_id = 'media' and public.is_admin());

create policy "media_bucket_admin_update"
on storage.objects for update
using (bucket_id = 'media' and public.is_admin())
with check (bucket_id = 'media' and public.is_admin());

create policy "media_bucket_admin_delete"
on storage.objects for delete
using (bucket_id = 'media' and public.is_admin());
