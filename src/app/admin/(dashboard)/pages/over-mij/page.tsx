import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { getPageBySlugAdmin } from "@/lib/data/admin";
import { updateOverMijPage } from "../actions";

export const metadata: Metadata = { title: "Over mij" };

export default async function AdminOverMijPagePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const page = await getPageBySlugAdmin("over-mij");
  const content = (page?.content as { paragraphs?: string[] } | null) ?? {};

  return (
    <div>
      <PageHeader title="Over mij" description="De tekst op de over mij-pagina." />
      <Notice notice={notice} type={type} />

      <form action={updateOverMijPage} className="max-w-2xl space-y-6">
        <FormField label="Tekst" htmlFor="paragraphs" optional>
          <textarea
            id="paragraphs"
            name="paragraphs"
            rows={12}
            defaultValue={content.paragraphs?.join("\n\n") ?? ""}
            className={inputClasses()}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Scheid alinea&apos;s met een lege regel ertussen. Laat leeg om de standaardtekst van Marianka te
            gebruiken.
          </p>
        </FormField>

        <div className="border-t border-line pt-6">
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">SEO</p>
          <div className="space-y-6">
            <FormField label="SEO-titel" htmlFor="seo_title" optional>
              <input id="seo_title" name="seo_title" defaultValue={page?.seo_title ?? ""} className={inputClasses()} />
            </FormField>
            <FormField label="SEO-omschrijving" htmlFor="seo_description" optional>
              <textarea
                id="seo_description"
                name="seo_description"
                rows={3}
                defaultValue={page?.seo_description ?? ""}
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
