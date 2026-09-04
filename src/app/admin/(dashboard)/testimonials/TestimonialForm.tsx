import { FormField, inputClasses } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Media, Testimonial } from "@/lib/types/database.types";

export function TestimonialForm({
  testimonial,
  media,
  action,
}: {
  testimonial?: Testimonial;
  media: Media[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-xl space-y-6">
      <FormField label="Naam" htmlFor="name">
        <input id="name" name="name" defaultValue={testimonial?.name} required className={inputClasses()} />
      </FormField>

      <FormField label="Tekst" htmlFor="quote">
        <textarea
          id="quote"
          name="quote"
          rows={4}
          defaultValue={testimonial?.quote}
          required
          className={inputClasses()}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Sterren (1-5)" htmlFor="rating" optional>
          <input
            id="rating"
            name="rating"
            type="number"
            min="1"
            max="5"
            defaultValue={testimonial?.rating ?? ""}
            className={inputClasses()}
          />
        </FormField>

        <FormField label="Volgorde" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={testimonial?.sort_order ?? 0}
            className={inputClasses()}
          />
        </FormField>
      </div>

      <FormField label="Foto/avatar" htmlFor="avatar_media_id" optional>
        <select
          id="avatar_media_id"
          name="avatar_media_id"
          defaultValue={testimonial?.avatar_media_id ?? ""}
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

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_visible"
          defaultChecked={testimonial?.is_visible ?? true}
          className="h-4 w-4 accent-brown"
        />
        Zichtbaar op de website
      </label>

      <SubmitButton />
    </form>
  );
}
