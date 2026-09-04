-- Marianka Visser Fotografie — initial schema
-- Conventions: uuid primary keys, timestamptz timestamps, snake_case, RLS on every table.

create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles + is_admin() helper
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Security-definer so RLS policies elsewhere can check the caller's role
-- without recursively hitting RLS on profiles itself.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- No insert/update/delete policies for anon/authenticated: profile rows are
-- only ever managed via the Supabase service role (e.g. a one-off admin
-- provisioning script), never through the app's normal request path. This is
-- deliberate so a signed-up user can never self-promote to admin.

-- ============================================================================
-- shoots — created before media so media.shoot_id can reference it.
-- featured_image_id is added via a separate ALTER once media exists.
-- ============================================================================
create table if not exists public.shoots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  featured_image_id uuid,
  cta_label text default 'Plan een shoot',
  cta_url text default '/contact',
  is_specialty boolean not null default false,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shoots_sort_order_idx on public.shoots (sort_order);

alter table public.shoots enable row level security;

create policy "shoots_public_read" on public.shoots
  for select using (is_visible = true);

create policy "shoots_admin_all" on public.shoots
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- media — the photo library (Supabase Storage backed)
-- ============================================================================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  url text not null,
  width int,
  height int,
  file_size bigint,
  mime_type text,
  alt_text text not null default '',
  title text,
  description text,
  category text,
  shoot_id uuid references public.shoots (id) on delete set null,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_shoot_id_idx on public.media (shoot_id);
create index if not exists media_category_idx on public.media (category);
create index if not exists media_sort_order_idx on public.media (sort_order);

alter table public.media enable row level security;

create policy "media_public_read" on public.media
  for select using (is_visible = true);

create policy "media_admin_all" on public.media
  for all using (public.is_admin()) with check (public.is_admin());

-- Now that media exists, wire up shoots.featured_image_id.
alter table public.shoots
  add constraint shoots_featured_image_id_fkey
  foreign key (featured_image_id) references public.media (id) on delete set null;

-- ============================================================================
-- site_settings — singleton row with global, CMS-editable site info
-- ============================================================================
create table if not exists public.site_settings (
  id boolean primary key default true constraint single_row check (id),
  business_name text not null default 'Marianka Visser Fotografie',
  tagline text,
  email text not null default 'info@mariankavisserfotografie.nl',
  phone text,
  instagram_handle text default 'mariankavisser_fotografie',
  instagram_url text default 'https://www.instagram.com/mariankavisser_fotografie',
  domain text default 'mariankavisserfotografie.nl',
  location text default 'Damwâld',
  service_area text[] not null default array['Friesland', 'Groningen', 'Drenthe', 'Overijssel'],
  logo_media_id uuid references public.media (id) on delete set null,
  favicon_media_id uuid references public.media (id) on delete set null,
  footer_text text,
  testimonials_enabled boolean not null default false,
  seo_title_default text default 'Marianka Visser Fotografie',
  seo_description_default text default 'Fotograaf in Damwâld, actief in Friesland, Groningen, Drenthe en Overijssel. Gespecialiseerd in newborn-, gezins- en zwangerschapsfotografie.',
  og_image_media_id uuid references public.media (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- pricing_packages — flexible pricing, optionally linked to a shoot
-- ============================================================================
create table if not exists public.pricing_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  shoot_id uuid references public.shoots (id) on delete set null,
  price numeric(10, 2) not null,
  photo_count int,
  description text,
  extra_info text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pricing_packages_shoot_id_idx on public.pricing_packages (shoot_id);
create index if not exists pricing_packages_sort_order_idx on public.pricing_packages (sort_order);

alter table public.pricing_packages enable row level security;

create policy "pricing_packages_public_read" on public.pricing_packages
  for select using (is_visible = true);

create policy "pricing_packages_admin_all" on public.pricing_packages
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- faqs
-- ============================================================================
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_sort_order_idx on public.faqs (sort_order);

alter table public.faqs enable row level security;

create policy "faqs_public_read" on public.faqs
  for select using (is_visible = true);

create policy "faqs_admin_all" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- testimonials — CMS-managed but section can be globally toggled off
-- (see site_settings.testimonials_enabled)
-- ============================================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  avatar_media_id uuid references public.media (id) on delete set null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);

alter table public.testimonials enable row level security;

create policy "testimonials_public_read" on public.testimonials
  for select using (is_visible = true);

create policy "testimonials_admin_all" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- availability — which days/moments Marianka is bookable, shown on the
-- contact form and editable from the admin as a simple weekly grid
-- ============================================================================
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday .. 6 = Saturday
  day_label text not null,
  moment_label text not null, -- e.g. "Avond", "Ochtend", "Hele dag"
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists availability_day_idx on public.availability (day_of_week);

alter table public.availability enable row level security;

create policy "availability_public_read" on public.availability
  for select using (true);

create policy "availability_admin_all" on public.availability
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- pages — free-form CMS text blocks for pages that aren't fully modelled
-- (homepage hero/intro, over mij, contact intro, etc.) stored as jsonb so new
-- fields can be added per page without a migration.
-- ============================================================================
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, -- 'home' | 'over-mij' | 'contact' | ...
  title text,
  content jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  og_image_id uuid references public.media (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;

create policy "pages_public_read" on public.pages
  for select using (true);

create policy "pages_admin_all" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- contact_submissions — inquiries from the public booking form
-- Public (anon) may INSERT only. Nobody but admins may SELECT/UPDATE/DELETE.
-- ============================================================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  -- Loose format check only (mirrors the app-level zod validation) — this
  -- is a public-insertable table via the anon key, so the DB itself has to
  -- be the backstop against malformed/oversized data, not just our
  -- Next.js API route which a direct PostgREST call bypasses entirely.
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  phone text check (phone is null or char_length(phone) <= 30),
  shoot_id uuid references public.shoots (id) on delete set null,
  shoot_name_snapshot text check (shoot_name_snapshot is null or char_length(shoot_name_snapshot) <= 120),
  desired_date date,
  availability_preference text check (availability_preference is null or char_length(availability_preference) <= 200),
  how_found text check (how_found is null or char_length(how_found) <= 200),
  message text check (message is null or char_length(message) <= 4000),
  status text not null default 'nieuw' check (status in ('nieuw', 'in_behandeling', 'afgerond', 'gearchiveerd')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_status_idx on public.contact_submissions (status);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

create policy "contact_submissions_public_insert" on public.contact_submissions
  for insert
  with check (
    status = 'nieuw'
  );

create policy "contact_submissions_admin_select" on public.contact_submissions
  for select using (public.is_admin());

create policy "contact_submissions_admin_update" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "contact_submissions_admin_delete" on public.contact_submissions
  for delete using (public.is_admin());

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'site_settings', 'media', 'shoots', 'pricing_packages',
    'faqs', 'testimonials', 'availability', 'pages', 'contact_submissions'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;
