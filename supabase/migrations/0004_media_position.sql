-- Focal point + zoom for CMS-controlled image positioning (hero, and any
-- other fill/object-cover usage). Defaults reproduce today's centered,
-- unzoomed rendering exactly, so existing rows keep working unchanged.
alter table public.media
  add column if not exists focal_x numeric(5, 2) not null default 50 check (focal_x between 0 and 100),
  add column if not exists focal_y numeric(5, 2) not null default 50 check (focal_y between 0 and 100),
  add column if not exists zoom numeric(4, 2) not null default 1 check (zoom between 1 and 3);
