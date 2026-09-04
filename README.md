# Marianka Visser Fotografie

Website en CMS voor Marianka Visser Fotografie, gebouwd met Next.js (App Router), TypeScript, Tailwind CSS en Supabase.

## Stack

- **Next.js 16** (App Router, Server Actions, Route Handlers)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres database, Auth, Storage
- **Resend** — transactionele e-mail voor het contactformulier
- **Vercel** — aanbevolen hosting

## Projectstructuur

```
src/
  app/
    (site)/          publieke website (home, over mij, shoots, tarieven, faq, contact)
    admin/            CMS/dashboard (beveiligd, alleen voor admins)
    api/contact/      route handler voor het aanmeldformulier
    sitemap.ts        dynamische sitemap (incl. shoots)
    robots.ts
  components/
    home/             homepage-secties
    shoots/, pricing/, faq/, testimonials/   generieke, herbruikbare content-componenten
    admin/            dashboard UI-bouwstenen (sidebar, formulieren, tabellen)
    ui/               generieke primitives (Button, Container, MediaImage, ...)
  lib/
    supabase/         browser/server/admin/public Supabase clients
    data/             data access — public.ts (RLS-gescopeerd) en admin.ts
    validations/      zod-schema's per formulier
    types/            database.types.ts (handmatig, matcht de migraties)
supabase/
  migrations/         SQL-schema, RLS-policies, storage-bucket, seed-data
```

## Lokale setup

1. **Supabase-project aanmaken** op [supabase.com](https://supabase.com).
2. **Migraties uitvoeren** (via de SQL-editor in het Supabase-dashboard, in volgorde):
   - `supabase/migrations/0001_init.sql` — tabellen, RLS-policies
   - `supabase/migrations/0002_storage.sql` — storage-bucket `media` + policies
   - `supabase/migrations/0003_seed.sql` — bevestigde startcontent (shoots, FAQ, beschikbaarheid, tarieven)
3. **Env-variabelen instellen**: kopieer `.env.example` naar `.env.local` en vul in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — alleen server-side gebruikt, nooit naar de client sturen
   - `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, `RESEND_FROM_EMAIL` — voor de contactformulier-notificatie ([resend.com](https://resend.com); `RESEND_FROM_EMAIL` vereist een geverifieerd domein, anders wordt de gedeelde sandbox-afzender gebruikt)
4. **Eerste admin-account aanmaken**:
   - Maak een gebruiker aan via Supabase Dashboard → Authentication → Users → "Add user" (of via `supabase.auth.admin.createUser` met de service role key).
   - Voeg vervolgens een rij toe aan `profiles` met hetzelfde `id` en `role = 'admin'`:
     ```sql
     insert into public.profiles (id, email, role)
     values ('<user-id-uit-auth.users>', 'info@mariankavisserfotografie.nl', 'admin');
     ```
   - Er is bewust geen selfservice-registratie voor `/admin` — dit voorkomt dat iemand zichzelf tot admin kan maken.
5. **Installeren en starten**:
   ```bash
   npm install
   npm run dev
   ```
6. Bezoek `http://localhost:3000` voor de website en `http://localhost:3000/admin/login` voor het dashboard.

## Content beheren

Vrijwel alle content op de website komt uit de database en is beheerbaar via `/admin`: shoots, foto's, tarieven, FAQ, recensies, beschikbaarheid, aanvragen, vrije paginateksten (home/over mij), logo/favicon/deel-afbeelding en algemene instellingen. Niets hoeft in code aangepast te worden om tekst, foto's of prijzen te wijzigen.

Foto-uploads gaan rechtstreeks van de browser naar Supabase Storage (niet via een Next.js server-functie) — dat is bewust: serverless platforms zoals Vercel leggen een limiet op de grootte van een request-body die ruim onder een enkele hoge-resolutie foto ligt. Alleen ingelogde admins kunnen uploaden (afgedwongen door Storage-policies), en de bucket zelf accepteert ook alleen de toegestane bestandstypen tot 50MB.

## Deployen

Het project is Vercel-ready. Zet dezelfde env-variabelen als in `.env.example` in de Vercel-projectinstellingen en koppel de repository.

## Bekende aandachtspunten

- De koppeling tussen tarieven en specifieke shoots is bij oplevering nog niet vastgesteld door de klant; de drie bekende bedragen (€150/10 foto's, €350/30 foto's, €600/alle foto's) staan als algemene pakketten in de tarievenbeheer en kunnen daar alsnog aan een shoot gekoppeld worden.
- Recensies staan standaard uitgeschakeld totdat de klant besluit ze te gebruiken (schakelbaar in `/admin/testimonials`).
