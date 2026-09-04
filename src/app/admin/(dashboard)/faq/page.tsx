import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { getAllFaqs } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Veelgestelde vragen" };

export default async function AdminFaqPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const faqs = await getAllFaqs();

  return (
    <div>
      <PageHeader
        title="Veelgestelde vragen"
        description="Beheer de FAQ die op de website wordt getoond."
        action={
          <Link
            href="/admin/faq/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-brown-dark"
          >
            <Plus size={16} /> Nieuwe vraag
          </Link>
        }
      />

      <Notice notice={notice} type={type} />

      {faqs.length === 0 ? (
        <p className="text-sm text-ink-soft">Er zijn nog geen vragen toegevoegd.</p>
      ) : (
        <div className="divide-y divide-line rounded-sm border border-line bg-paper">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{faq.question}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                  Volgorde {faq.sort_order} &middot;{" "}
                  <span className={faq.is_visible ? "text-green-700" : "text-gray-500"}>
                    {faq.is_visible ? "Zichtbaar" : "Verborgen"}
                  </span>
                </p>
              </div>
              <Link href={`/admin/faq/${faq.id}`} className="shrink-0 text-sm text-brown hover:text-brown-dark">
                Bewerken
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
