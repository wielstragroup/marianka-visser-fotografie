import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { inputClasses } from "@/components/ui/FormField";
import { getAllAvailability } from "@/lib/data/admin";
import { updateAvailability } from "./actions";

export const metadata: Metadata = { title: "Beschikbaarheid" };

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const availability = await getAllAvailability();

  return (
    <div>
      <PageHeader
        title="Beschikbaarheid"
        description="Deze week-indeling wordt getoond op de contactpagina en als optie in het aanmeldformulier."
      />
      <Notice notice={notice} type={type} />

      <form action={updateAvailability} className="max-w-2xl">
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-blush-soft/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Dag</th>
                <th className="px-5 py-3 font-medium">Moment</th>
                <th className="px-5 py-3 font-medium">Beschikbaar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {availability.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-ink">{row.day_label}</td>
                  <td className="px-5 py-4">
                    <input
                      name={`moment_label_${row.id}`}
                      defaultValue={row.moment_label}
                      className={inputClasses()}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      name={`is_available_${row.id}`}
                      defaultChecked={row.is_available}
                      className="h-5 w-5 accent-brown"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="mt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
