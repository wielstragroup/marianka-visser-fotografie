import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Pagina's" };

const PAGES = [
  { slug: "home", label: "Home", description: "Introductietekst en SEO van de homepage." },
  { slug: "over-mij", label: "Over mij", description: "De tekst op de over mij-pagina en SEO." },
];

export default function AdminPagesPage() {
  return (
    <div>
      <PageHeader title="Pagina's" description="Bewerk vrije tekstblokken die niet bij een specifieke module horen." />

      <div className="divide-y divide-line rounded-sm border border-line bg-paper">
        {PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/pages/${page.slug}`}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-blush-soft/30"
          >
            <div>
              <p className="font-medium text-ink">{page.label}</p>
              <p className="text-xs text-ink-soft">{page.description}</p>
            </div>
            <span className="text-sm text-brown">Bewerken</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
