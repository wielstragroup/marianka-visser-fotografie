import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { getAllPricingPackages, getAllShoots } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Tarieven" };

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const [packages, shoots] = await Promise.all([getAllPricingPackages(), getAllShoots()]);
  const shootNameById = new Map(shoots.map((s) => [s.id, s.name]));

  return (
    <div>
      <PageHeader
        title="Tarieven"
        description="Beheer de pakketten en prijzen die op de website worden getoond."
        action={
          <Link
            href="/admin/pricing/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-brown-dark"
          >
            <Plus size={16} /> Nieuw tarief
          </Link>
        }
      />

      <Notice notice={notice} type={type} />

      {packages.length === 0 ? (
        <p className="text-sm text-ink-soft">Er zijn nog geen tarieven toegevoegd.</p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-blush-soft/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Pakket</th>
                <th className="px-5 py-3 font-medium">Shoot</th>
                <th className="px-5 py-3 font-medium">Prijs</th>
                <th className="px-5 py-3 font-medium">Foto&apos;s</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-5 py-4 font-medium text-ink">
                    <span className="flex items-center gap-2">
                      {pkg.name}
                      {pkg.is_featured && <Star size={14} className="text-brown" fill="currentColor" />}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {pkg.shoot_id ? shootNameById.get(pkg.shoot_id) ?? "—" : "Algemeen"}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{formatPrice(pkg.price)}</td>
                  <td className="px-5 py-4 text-ink-soft">{pkg.photo_count ?? "Alle"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        pkg.is_visible
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                          : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      }
                    >
                      {pkg.is_visible ? "Zichtbaar" : "Verborgen"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/pricing/${pkg.id}`} className="text-sm text-brown hover:text-brown-dark">
                      Bewerken
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
