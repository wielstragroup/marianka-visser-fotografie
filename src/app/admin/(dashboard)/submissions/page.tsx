import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAllSubmissions } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, STATUS_OPTIONS, STATUS_STYLES } from "@/lib/constants/submissions";
import type { SubmissionStatus } from "@/lib/types/database.types";

export const metadata: Metadata = { title: "Aanvragen" };

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = STATUS_OPTIONS.includes(status as SubmissionStatus) ? (status as SubmissionStatus) : undefined;
  const submissions = await getAllSubmissions(validStatus ? { status: validStatus } : undefined);

  return (
    <div>
      <PageHeader title="Aanvragen" description="Alle ingevulde aanmeldformulieren." />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/submissions"
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium",
            !validStatus ? "bg-ink text-cream" : "bg-blush-soft text-ink-soft hover:text-ink"
          )}
        >
          Alles
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium",
              validStatus === s ? "bg-ink text-cream" : "bg-blush-soft text-ink-soft hover:text-ink"
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-ink-soft">Er zijn nog geen aanvragen.</p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-blush-soft/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-5 py-3 font-medium">Shoot</th>
                <th className="px-5 py-3 font-medium">Datum</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/submissions/${s.id}`} className="font-medium text-ink hover:text-brown">
                      {s.name}
                    </Link>
                    <p className="text-xs text-ink-soft">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{s.shoot_name_snapshot ?? "—"}</td>
                  <td className="px-5 py-4 text-ink-soft">{formatDateTime(s.created_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
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
