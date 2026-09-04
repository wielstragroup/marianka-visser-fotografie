import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { getAllShoots } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Shoots" };

export default async function AdminShootsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const shoots = await getAllShoots();

  return (
    <div>
      <PageHeader
        title="Shoots"
        description="Beheer de fotoshoots die op de website worden getoond."
        action={
          <Link
            href="/admin/shoots/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-brown-dark"
          >
            <Plus size={16} /> Nieuwe shoot
          </Link>
        }
      />

      <Notice notice={notice} type={type} />

      {shoots.length === 0 ? (
        <p className="text-sm text-ink-soft">Er zijn nog geen shoots toegevoegd.</p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-blush-soft/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Volgorde</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shoots.map((shoot) => (
                <tr key={shoot.id}>
                  <td className="px-5 py-4 font-medium text-ink">
                    <span className="flex items-center gap-2">
                      {shoot.name}
                      {shoot.is_specialty && <Star size={14} className="text-brown" fill="currentColor" />}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{shoot.slug}</td>
                  <td className="px-5 py-4 text-ink-soft">{shoot.sort_order}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        shoot.is_visible
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                          : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      }
                    >
                      {shoot.is_visible ? "Zichtbaar" : "Verborgen"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/shoots/${shoot.id}`} className="text-sm text-brown hover:text-brown-dark">
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
