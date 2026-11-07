-- Optional customer photo on a review.
--
-- The `media` bucket is public, so an unreviewed customer photo can't live
-- there. It goes into a private bucket instead, and only gets copied to
-- `media` (and linked through the existing avatar_media_id) when an admin
-- approves the review. Taking the review offline removes that public copy
-- again; see src/lib/testimonial-photos.ts.
--
-- Non-destructive, safe to run more than once, and safe to run before the
-- matching code is deployed.

begin;

alter table public.testimonials
  add column if not exists photo_path text,
  add column if not exists photo_consent boolean not null default false;

-- A customer photo can't exist without its own consent, so approving a review
-- can never publish a photo the customer didn't agree to.
alter table public.testimonials
  drop constraint if exists testimonials_photo_needs_consent;

alter table public.testimonials
  add constraint testimonials_photo_needs_consent
    check (photo_path is null or photo_consent) not valid;

-- Private on purpose, with no storage.objects policies at all: anon and
-- authenticated get nothing, so only the server (service role, after its own
-- validation or requireAdmin()) can touch these files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'testimonial-photos',
  'testimonial-photos',
  false,
  5242880, -- 5MB, matches REVIEW_PHOTO_MAX_BYTES in src/lib/validations/testimonial.ts
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Tightened, not loosened: a direct PostgREST call still can't attach any
-- media id or storage path. Reviews with a photo are inserted by the API route
-- after it has validated and stored the file itself.
drop policy if exists "testimonials_public_insert" on public.testimonials;
create policy "testimonials_public_insert" on public.testimonials
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and approved_at is null
    and publication_consent = true
    and rating is not null
    and avatar_media_id is null
    and photo_path is null
    and photo_consent = false
    and sort_order = 0
  );

commit;
