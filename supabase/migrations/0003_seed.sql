-- Seed only the content that has actually been confirmed by the client.
-- No invented reviews, prices, or copy — anything undecided is left for the
-- admin to fill in via the CMS.

insert into public.site_settings (id) values (true)
on conflict (id) do nothing;

insert into public.shoots (name, slug, short_description, is_specialty, sort_order, is_visible) values
  ('Loveshoot', 'loveshoot', null, false, 1, true),
  ('Zwangerschapsshoot', 'zwangerschapsshoot', null, false, 2, true),
  ('Newbornshoot', 'newbornshoot', null, true, 3, true),
  ('Gezinsshoot', 'gezinsshoot', null, false, 4, true),
  ('Familieshoot', 'familieshoot', null, false, 5, true)
on conflict (slug) do nothing;

-- Confirmed amounts, not yet tied to a specific shoot — kept as general
-- packages so the admin can link or rename them once that's decided.
insert into public.pricing_packages (name, price, photo_count, sort_order, is_visible) values
  ('Basis', 150.00, 10, 1, true),
  ('Uitgebreid', 350.00, 30, 2, true),
  ('Alle foto''s', 600.00, null, 3, true)
on conflict do nothing;

insert into public.faqs (question, answer, sort_order, is_visible) values
  (
    'Waar ben je gevestigd en waar werk je?',
    'Ik woon in Damwâld en werk in Friesland, Groningen, Drenthe en Overijssel.',
    1,
    true
  ),
  (
    'Hoe lang duurt een fotoshoot?',
    'Een newbornshoot duurt ongeveer 1,5 uur. Overige shoots duren gemiddeld ongeveer 1 uur.',
    2,
    true
  ),
  (
    'Wanneer ontvang ik de foto''s?',
    'Je ontvangt je foto''s binnen 3 weken na de shoot.',
    3,
    true
  )
on conflict do nothing;

-- Weekly availability grid.
insert into public.availability (day_of_week, day_label, moment_label, is_available, sort_order) values
  (1, 'Maandag', 'Avond', true, 1),
  (2, 'Dinsdag', 'Avond', true, 2),
  (3, 'Woensdag', 'Hele dag', true, 3),
  (4, 'Donderdag', 'Avond', true, 4),
  (5, 'Vrijdag', 'Ochtend', true, 5),
  (6, 'Zaterdag', 'Hele dag', true, 6),
  (0, 'Zondag', 'Niet beschikbaar', false, 7)
on conflict (day_of_week) do nothing;

insert into public.pages (slug, title, content) values
  ('home', 'Home', '{}'::jsonb),
  ('over-mij', 'Over mij', '{}'::jsonb),
  ('contact', 'Contact', '{}'::jsonb)
on conflict (slug) do nothing;
