import { FormField, inputClasses } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { PricingPackage, Shoot } from "@/lib/types/database.types";

export function PricingForm({
  pkg,
  shoots,
  action,
}: {
  pkg?: PricingPackage;
  shoots: Shoot[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-xl space-y-6">
      <FormField label="Pakketnaam" htmlFor="name">
        <input id="name" name="name" defaultValue={pkg?.name} required className={inputClasses()} />
      </FormField>

      <FormField label="Shoot / categorie" htmlFor="shoot_id" optional>
        <select id="shoot_id" name="shoot_id" defaultValue={pkg?.shoot_id ?? ""} className={inputClasses()}>
          <option value="">Algemeen (niet aan een specifieke shoot gekoppeld)</option>
          {shoots.map((shoot) => (
            <option key={shoot.id} value={shoot.id}>
              {shoot.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Prijs (EUR)" htmlFor="price">
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={pkg?.price}
            required
            className={inputClasses()}
          />
        </FormField>

        <FormField label="Aantal foto's" htmlFor="photo_count" optional>
          <input
            id="photo_count"
            name="photo_count"
            type="number"
            min="0"
            defaultValue={pkg?.photo_count ?? ""}
            placeholder="Laat leeg voor 'alle foto's'"
            className={inputClasses()}
          />
        </FormField>
      </div>

      <FormField label="Beschrijving" htmlFor="description" optional>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={pkg?.description ?? ""}
          className={inputClasses()}
        />
      </FormField>

      <FormField label="Extra informatie" htmlFor="extra_info" optional>
        <input
          id="extra_info"
          name="extra_info"
          defaultValue={pkg?.extra_info ?? ""}
          placeholder="Bijv. 'Inclusief reistijd binnen 30 km'"
          className={inputClasses()}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Volgorde" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={pkg?.sort_order ?? 0}
            className={inputClasses()}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={pkg?.is_featured ?? false}
            className="h-4 w-4 accent-brown"
          />
          Uitgelicht pakket
        </label>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_visible"
            defaultChecked={pkg?.is_visible ?? true}
            className="h-4 w-4 accent-brown"
          />
          Zichtbaar op de website
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
