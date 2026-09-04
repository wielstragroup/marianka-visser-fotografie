import { FormField, inputClasses } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Media, Shoot } from "@/lib/types/database.types";

export function ShootForm({
  shoot,
  media,
  action,
}: {
  shoot?: Shoot;
  media: Media[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Naam" htmlFor="name">
          <input id="name" name="name" defaultValue={shoot?.name} required className={inputClasses()} />
        </FormField>

        <FormField label="Slug" htmlFor="slug">
          <input
            id="slug"
            name="slug"
            defaultValue={shoot?.slug}
            required
            pattern="[a-z0-9-]+"
            placeholder="bijv. newbornshoot"
            className={inputClasses()}
          />
        </FormField>
      </div>

      <FormField label="Korte omschrijving / subtitel" htmlFor="short_description" optional>
        <input
          id="short_description"
          name="short_description"
          placeholder="Bijv. 'Puur & liefdevol'"
          defaultValue={shoot?.short_description ?? ""}
          className={inputClasses()}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Verschijnt onder de titel op de shootpagina en als korte tekst bij de kaart.
        </p>
      </FormField>

      <FormField label="Uitgebreide omschrijving" htmlFor="long_description" optional>
        <textarea
          id="long_description"
          name="long_description"
          rows={6}
          defaultValue={shoot?.long_description ?? ""}
          className={inputClasses()}
        />
      </FormField>

      <FormField label="Featured afbeelding" htmlFor="featured_image_id" optional>
        <select
          id="featured_image_id"
          name="featured_image_id"
          defaultValue={shoot?.featured_image_id ?? ""}
          className={inputClasses()}
        >
          <option value="">Geen</option>
          {media.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title || item.alt_text || item.storage_path}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="CTA-tekst" htmlFor="cta_label" optional>
          <input
            id="cta_label"
            name="cta_label"
            defaultValue={shoot?.cta_label ?? "Plan een shoot"}
            className={inputClasses()}
          />
        </FormField>

        <FormField label="CTA-link" htmlFor="cta_url" optional>
          <input
            id="cta_url"
            name="cta_url"
            defaultValue={shoot?.cta_url ?? "/contact"}
            className={inputClasses()}
          />
        </FormField>

        <FormField label="Volgorde" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={shoot?.sort_order ?? 0}
            className={inputClasses()}
          />
        </FormField>

        <FormField label="Duur" htmlFor="duration_label" optional>
          <input
            id="duration_label"
            name="duration_label"
            placeholder="Bijv. 'Ongeveer 1 uur'"
            defaultValue={shoot?.duration_label ?? ""}
            className={inputClasses()}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_specialty"
            defaultChecked={shoot?.is_specialty ?? false}
            className="h-4 w-4 accent-brown"
          />
          Specialiteit (bijv. newborn)
        </label>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_visible"
            defaultChecked={shoot?.is_visible ?? true}
            className="h-4 w-4 accent-brown"
          />
          Zichtbaar op de website
        </label>
      </div>

      <div className="border-t border-line pt-6">
        <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">SEO</p>
        <div className="space-y-6">
          <FormField label="SEO-titel" htmlFor="seo_title" optional>
            <input id="seo_title" name="seo_title" defaultValue={shoot?.seo_title ?? ""} className={inputClasses()} />
          </FormField>
          <FormField label="SEO-omschrijving" htmlFor="seo_description" optional>
            <textarea
              id="seo_description"
              name="seo_description"
              rows={3}
              defaultValue={shoot?.seo_description ?? ""}
              className={inputClasses()}
            />
          </FormField>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
