-- Feedback pass (2026-09-05): new confirmed pricing structure from the client.
-- Loveshoot, Zwangerschapshoot, Newbornshoot and Gezinsshoot all use the same
-- "€150 incl. 10 foto's, +€10 per extra foto" model. Familieshoot uses a
-- different model (€350 incl. 30 foto's, or €600 voor alle foto's) — no
-- schema change needed, pricing_packages already supports per-shoot linking
-- via shoot_id plus free-text extra_info, so this only updates data.

-- Re-home the 3 existing generic (unlinked) packages onto specific shoots
-- instead of inserting+deleting, so any admin edits to sort_order/is_visible
-- on these rows are preserved.
update public.pricing_packages set
  name = 'Loveshoot',
  shoot_id = (select id from public.shoots where slug = 'loveshoot'),
  price = 150.00,
  photo_count = 10,
  extra_info = 'Extra foto''s: €10 per foto',
  sort_order = 1
where name = 'Basis' and shoot_id is null;

update public.pricing_packages set
  name = 'Familieshoot',
  shoot_id = (select id from public.shoots where slug = 'familieshoot'),
  price = 350.00,
  photo_count = 30,
  extra_info = 'Liever alle foto''s? Dat kan voor €600.',
  sort_order = 5
where name = 'Uitgebreid' and shoot_id is null;

update public.pricing_packages set
  name = 'Familieshoot — alle foto''s',
  shoot_id = (select id from public.shoots where slug = 'familieshoot'),
  price = 600.00,
  photo_count = null,
  description = 'Alle foto''s van de shoot, zonder limiet.',
  extra_info = null,
  sort_order = 6
where name = 'Alle foto''s' and shoot_id is null;

insert into public.pricing_packages (name, shoot_id, price, photo_count, extra_info, sort_order, is_visible)
select 'Zwangerschapshoot', id, 150.00, 10, 'Extra foto''s: €10 per foto', 2, true
from public.shoots where slug = 'zwangerschapsshoot'
and not exists (select 1 from public.pricing_packages where shoot_id = public.shoots.id);

insert into public.pricing_packages (name, shoot_id, price, photo_count, extra_info, sort_order, is_visible)
select 'Newbornshoot', id, 150.00, 10, 'Extra foto''s: €10 per foto', 3, true
from public.shoots where slug = 'newbornshoot'
and not exists (select 1 from public.pricing_packages where shoot_id = public.shoots.id);

insert into public.pricing_packages (name, shoot_id, price, photo_count, extra_info, sort_order, is_visible)
select 'Gezinsshoot', id, 150.00, 10, 'Extra foto''s: €10 per foto', 4, true
from public.shoots where slug = 'gezinsshoot'
and not exists (select 1 from public.pricing_packages where shoot_id = public.shoots.id);

-- Travel cost text: client wants the per-km rate explicitly anchored to
-- Damwâld (this is about the calculation origin, unrelated to the separate
-- "don't imply a home studio" request elsewhere). Only touch it if it still
-- has the old default, so a custom admin edit isn't clobbered.
update public.site_settings set
  travel_cost_text = 'Reiskosten: €0,25 per km vanaf Damwâld.'
where travel_cost_text = 'Reiskosten: €0,25 per km.';

alter table public.site_settings
  alter column travel_cost_text set default 'Reiskosten: €0,25 per km vanaf Damwâld.';

-- FAQ copy: clarify the two-step delivery (keuzegalerij, then definitieve
-- foto's) instead of a single vague "binnen 3 weken".
update public.faqs set
  answer = 'Binnen 3 weken ontvang je een keuzegalerij waaruit je zelf je favoriete foto''s kunt kiezen. Nadat je jouw keuze hebt doorgegeven, ontvang je de definitieve foto''s binnen een week.'
where question = 'Wanneer ontvang ik de foto''s?';
