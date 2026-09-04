import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getAllTestimonials, getSiteSettingsAdmin } from "@/lib/data/admin";
import { setTestimonialsEnabled } from "./actions";

export const metadata: Metadata = { title: "Recensies" };

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const [testimonials, settings] = await Promise.all([getAllTestimonials(), getSiteSettingsAdmin()]);

  return (
    <div>
      <PageHeader
        title="Recensies"
        description="Beheer klantrecensies. De sectie is optioneel — schakel hem hieronder in of uit."
        action={
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-brown-dark"
          >
            <Plus size={16} /> Nieuwe recensie
          </Link>
        }
      />

      <Notice notice={notice} type={type} />

      <form
        action={setTestimonialsEnabled}
        className="mb-8 flex items-center justify-between gap-4 rounded-sm border border-line bg-blush-soft/50 px-5 py-4"
      >
        <div>
          <p className="text-sm font-medium text-ink">Recensiesectie op de website tonen</p>
          <p className="text-xs text-ink-soft">
            Als dit uit staat, wordt de recensiesectie nergens op de website getoond — ook niet als er
            recensies zijn toegevoegd.
          </p>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="testimonials_enabled"
            defaultChecked={settings?.testimonials_enabled ?? false}
            className="h-5 w-5 accent-brown"
          />
        </label>
        <SubmitButton className="shrink-0">Toepassen</SubmitButton>
      </form>

      {testimonials.length === 0 ? (
        <p className="text-sm text-ink-soft">Er zijn nog geen recensies toegevoegd.</p>
      ) : (
        <div className="divide-y divide-line rounded-sm border border-line bg-paper">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-ink">
                  {t.name}
                  {t.rating && (
                    <span className="flex items-center gap-0.5 text-brown">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">{t.quote}</p>
              </div>
              <Link href={`/admin/testimonials/${t.id}`} className="shrink-0 text-sm text-brown hover:text-brown-dark">
                Bewerken
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
