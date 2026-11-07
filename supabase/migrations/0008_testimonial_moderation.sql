-- Klantrecensies met goedkeuring.
--
-- Extends the existing testimonials table (no new table, nothing dropped) so
-- visitors can submit reviews that only go public after an admin approves
-- them. Safe to run more than once, and safe to run before the matching code
-- is deployed: the old code keeps working, and because RLS now filters on
-- status, a pending row can't reach the public site through it either.
--
-- is_visible is superseded by status and no longer read by the app. It stays
-- in place so this migration remains non-destructive.

begin;

-- ============================================================================
-- Columns
-- ============================================================================
alter table public.testimonials
  add column if not exists shoot_type text,
  add column if not exists publication_consent boolean not null default false,
  add column if not exists approved_at timestamptz;

-- The backfill lives inside the existence check on purpose: on a re-run it
-- would otherwise publish genuine pending reviews (is_visible defaults to
-- true for those as well).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'testimonials' and column_name = 'status'
  ) then
    alter table public.testimonials
      add column status text not null default 'pending'
      check (status in ('pending', 'approved', 'rejected'));

    -- Everything currently live was entered by an admin and stays live.
    update public.testimonials
      set status = 'approved', approved_at = created_at, publication_consent = true
      where is_visible = true;

    update public.testimonials
      set status = 'rejected'
      where is_visible = false;
  end if;
end;
$$;

-- ============================================================================
-- Constraints — the anon key is public, so a direct PostgREST call bypasses
-- the API route entirely and the database has to be the backstop.
-- NOT VALID: enforced for every new write without judging existing rows.
-- ============================================================================
alter table public.testimonials
  drop constraint if exists testimonials_name_length,
  drop constraint if exists testimonials_quote_length,
  drop constraint if exists testimonials_shoot_type_length,
  drop constraint if exists testimonials_approved_needs_consent;

alter table public.testimonials
  add constraint testimonials_name_length
    check (char_length(btrim(name)) between 1 and 120) not valid,
  add constraint testimonials_quote_length
    check (char_length(btrim(quote)) between 1 and 2000) not valid,
  add constraint testimonials_shoot_type_length
    check (shoot_type is null or char_length(shoot_type) <= 120) not valid,
  add constraint testimonials_approved_needs_consent
    check (status <> 'approved' or publication_consent) not valid;

create index if not exists testimonials_status_idx on public.testimonials (status, approved_at desc);
create index if not exists testimonials_created_at_idx on public.testimonials (created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================
grant select, insert on public.testimonials to anon, authenticated;

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select using (status = 'approved');

-- Visitors may only ever create an unpublished, consented review. There are
-- deliberately no public update/delete policies: those stay limited to
-- testimonials_admin_all (is_admin()).
drop policy if exists "testimonials_public_insert" on public.testimonials;
create policy "testimonials_public_insert" on public.testimonials
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and approved_at is null
    and publication_consent = true
    and rating is not null
    and avatar_media_id is null
    and sort_order = 0
  );

-- ============================================================================
-- Global submission cap. The API route's rate limiter is per server instance
-- and direct PostgREST calls skip it, so this is what actually stops a flood
-- from burying real reviews. Security definer because the caller can't see
-- pending rows through RLS and would otherwise always count zero. created_at
-- is forced so a caller can't backdate rows to slip under the cap.
-- ============================================================================
create or replace function public.throttle_pending_testimonials()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    new.created_at := now();

    if (
      select count(*) from public.testimonials
      where created_at > now() - interval '1 hour'
    ) >= 30 then
      raise exception 'Too many testimonials submitted' using errcode = 'MV429';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists throttle_pending_testimonials on public.testimonials;
create trigger throttle_pending_testimonials
  before insert on public.testimonials
  for each row execute function public.throttle_pending_testimonials();

commit;
