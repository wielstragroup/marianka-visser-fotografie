import { FormField, inputClasses } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Faq } from "@/lib/types/database.types";

export function FaqForm({ faq, action }: { faq?: Faq; action: (formData: FormData) => void }) {
  return (
    <form action={action} className="max-w-xl space-y-6">
      <FormField label="Vraag" htmlFor="question">
        <input id="question" name="question" defaultValue={faq?.question} required className={inputClasses()} />
      </FormField>

      <FormField label="Antwoord" htmlFor="answer">
        <textarea
          id="answer"
          name="answer"
          rows={5}
          defaultValue={faq?.answer}
          required
          className={inputClasses()}
        />
      </FormField>

      <FormField label="Volgorde" htmlFor="sort_order">
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={faq?.sort_order ?? 0}
          className={inputClasses()}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_visible"
          defaultChecked={faq?.is_visible ?? true}
          className="h-4 w-4 accent-brown"
        />
        Zichtbaar op de website
      </label>

      <SubmitButton />
    </form>
  );
}
