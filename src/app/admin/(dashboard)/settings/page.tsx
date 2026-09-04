import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { getAllMedia, getSiteSettingsAdmin } from "@/lib/data/admin";
import { updateSiteSettings } from "./actions";

export const metadata: Metadata = { title: "Instellingen" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const [settings, media] = await Promise.all([getSiteSettingsAdmin(), getAllMedia()]);

  return (
    <div>
      <PageHeader title="Instellingen" description="Algemene gegevens van de website." />
      <Notice notice={notice} type={type} />

      <form action={updateSiteSettings} className="max-w-2xl space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Bedrijfsnaam" htmlFor="business_name">
            <input
              id="business_name"
              name="business_name"
              defaultValue={settings?.business_name}
              required
              className={inputClasses()}
            />
          </FormField>

          <FormField label="E-mailadres" htmlFor="email">
            <input id="email" name="email" type="email" defaultValue={settings?.email} required className={inputClasses()} />
          </FormField>
        </div>

        <FormField label="Tagline / ondertitel op de homepage" htmlFor="tagline" optional>
          <input
            id="tagline"
            name="tagline"
            defaultValue={settings?.tagline ?? ""}
            placeholder="Pure momenten, warme herinneringen."
            className={inputClasses()}
          />
        </FormField>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Telefoonnummer" htmlFor="phone" optional>
            <input id="phone" name="phone" defaultValue={settings?.phone ?? ""} className={inputClasses()} />
          </FormField>

          <FormField label="Domein" htmlFor="domain" optional>
            <input id="domain" name="domain" defaultValue={settings?.domain ?? ""} className={inputClasses()} />
          </FormField>

          <FormField label="Instagram-gebruikersnaam" htmlFor="instagram_handle" optional>
            <input
              id="instagram_handle"
              name="instagram_handle"
              defaultValue={settings?.instagram_handle ?? ""}
              className={inputClasses()}
            />
          </FormField>

          <FormField label="Instagram-link" htmlFor="instagram_url" optional>
            <input
              id="instagram_url"
              name="instagram_url"
              defaultValue={settings?.instagram_url ?? ""}
              className={inputClasses()}
            />
          </FormField>

          <FormField label="Locatie" htmlFor="location" optional>
            <input id="location" name="location" defaultValue={settings?.location ?? ""} className={inputClasses()} />
          </FormField>
        </div>

        <FormField label="Werkgebied" htmlFor="service_area" optional>
          <input
            id="service_area"
            name="service_area"
            defaultValue={settings?.service_area.join(", ") ?? ""}
            placeholder="Friesland, Groningen, Drenthe, Overijssel"
            className={inputClasses()}
          />
          <p className="mt-1 text-xs text-ink-soft">Gescheiden door komma&apos;s.</p>
        </FormField>

        <FormField label="Footer-tekst" htmlFor="footer_text" optional>
          <input id="footer_text" name="footer_text" defaultValue={settings?.footer_text ?? ""} className={inputClasses()} />
        </FormField>

        <FormField label="Reiskosten" htmlFor="travel_cost_text" optional>
          <input
            id="travel_cost_text"
            name="travel_cost_text"
            placeholder="Reiskosten: €0,25 per km."
            defaultValue={settings?.travel_cost_text ?? ""}
            className={inputClasses()}
          />
          <p className="mt-1 text-xs text-ink-soft">Wordt getoond bij de tarieven op de website.</p>
        </FormField>

        <div className="border-t border-line pt-6">
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Media</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Logo" htmlFor="logo_media_id" optional>
              <select
                id="logo_media_id"
                name="logo_media_id"
                defaultValue={settings?.logo_media_id ?? ""}
                className={inputClasses()}
              >
                <option value="">Geen (toon bedrijfsnaam als tekst)</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || item.alt_text || item.storage_path}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Favicon" htmlFor="favicon_media_id" optional>
              <select
                id="favicon_media_id"
                name="favicon_media_id"
                defaultValue={settings?.favicon_media_id ?? ""}
                className={inputClasses()}
              >
                <option value="">Standaard</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || item.alt_text || item.storage_path}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-soft">Gebruik het liefst een vierkante afbeelding.</p>
            </FormField>

            <FormField label="Deel-afbeelding (Open Graph)" htmlFor="og_image_media_id" optional>
              <select
                id="og_image_media_id"
                name="og_image_media_id"
                defaultValue={settings?.og_image_media_id ?? ""}
                className={inputClasses()}
              >
                <option value="">Geen</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || item.alt_text || item.storage_path}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-soft">
                Wordt getoond wanneer de website gedeeld wordt op social media.
              </p>
            </FormField>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Algemene SEO</p>
          <div className="space-y-6">
            <FormField label="Standaard SEO-titel" htmlFor="seo_title_default" optional>
              <input
                id="seo_title_default"
                name="seo_title_default"
                defaultValue={settings?.seo_title_default ?? ""}
                className={inputClasses()}
              />
            </FormField>
            <FormField label="Standaard SEO-omschrijving" htmlFor="seo_description_default" optional>
              <textarea
                id="seo_description_default"
                name="seo_description_default"
                rows={3}
                defaultValue={settings?.seo_description_default ?? ""}
                className={inputClasses()}
              />
            </FormField>
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
