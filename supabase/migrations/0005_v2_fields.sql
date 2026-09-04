-- V2 polish pass — small schema additions.
-- duration_label: free-text shoot duration shown on the shoot detail page
-- (e.g. "Ongeveer 1 uur"), editable per shoot from the admin.
-- travel_cost_text: CMS-editable travel cost note shown near pricing.
alter table public.shoots
  add column if not exists duration_label text;

alter table public.site_settings
  add column if not exists travel_cost_text text default 'Reiskosten: €0,25 per km.';
