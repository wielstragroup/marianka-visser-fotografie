import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { getPageBySlugAdmin } from "@/lib/data/admin";
import { updateHomePage } from "../actions";

export const metadata: Metadata = { title: "Home" };

export default async function AdminHomePagePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const page = await getPageBySlugAdmin("home");
  const content =
    (page?.content as { intro_text?: string; about_teaser_text?: string; shoots_quote?: string } | null) ?? {};

  return (
    <div>
      <PageHeader title="Homepage" description="De introductietekst en SEO van de homepage." />
      <Notice notice={notice} type={type} />

      <form action={updateHomePage} className="max-w-2xl space-y-6">
        <FormField label="Introductietekst" htmlFor="intro_text" optional>
          <textarea
            id="intro_text"
            name="intro_text"
            rows={5}
            defaultValue={content.intro_text ?? ""}
            className={inputClasses()}
          />
        </FormField>

        <FormField label="Over mij-tekst (homepage)" htmlFor="about_teaser_text" optional>
          <textarea
            id="about_teaser_text"
            name="about_teaser_text"
            rows={4}
            defaultValue={content.about_teaser_text ?? ""}
            className={inputClasses()}
          />
          <p className="mt-1 text-xs text-ink-soft">De korte tekst bij &ldquo;Wie is Marianka?&rdquo; op de homepage.</p>
        </FormField>

        <FormField label="Quote tussen de shoots" htmlFor="shoots_quote" optional>
          <textarea
            id="shoots_quote"
            name="shoots_quote"
            rows={2}
            defaultValue={content.shoots_quote ?? ""}
            className={inputClasses()}
          />
          <p className="mt-1 text-xs text-ink-soft">Korte quote die tussen de fotoshoots wordt getoond.</p>
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
