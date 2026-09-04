import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Image as ImageIcon, HelpCircle, Inbox, Plus, Upload, Tag, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { getDashboardStats, getRecentSubmissions } from "@/lib/data/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants/submissions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const { profile } = await requireAdmin();
  const [stats, recentSubmissions] = await Promise.all([getDashboardStats(), getRecentSubmissions(5)]);

  const statCards = [
    { label: "Shoots", value: stats.shootsCount, icon: Camera, href: "/admin/shoots" },
    { label: "Foto's", value: stats.mediaCount, icon: ImageIcon, href: "/admin/media" },
    { label: "FAQ-items", value: stats.faqsCount, icon: HelpCircle, href: "/admin/faq" },
    { label: "Aanvragen", value: stats.submissionsCount, icon: Inbox, href: "/admin/submissions" },
  ];

  const quickActions = [
    { label: "Nieuwe shoot toevoegen", href: "/admin/shoots/new", icon: Plus },
    { label: "Foto uploaden", href: "/admin/media", icon: Upload },
    { label: "Tarief aanpassen", href: "/admin/pricing", icon: Tag },
    { label: "FAQ toevoegen", href: "/admin/faq/new", icon: MessageSquareText },
  ];

  return (
    <div>
      <PageHeader
        title={`Welkom, ${profile.full_name || profile.email.split("@")[0]}`}
        description="Hier is een overzicht van je website."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-sm border border-line bg-paper p-6 transition-colors hover:border-brown"
            >
              <Icon className="text-brown" size={20} />
              <p className="mt-4 font-serif text-3xl text-ink">{card.value}</p>
              <p className="text-sm text-ink-soft">{card.label}</p>
              {card.label === "Aanvragen" && stats.newSubmissionsCount > 0 && (
                <p className="mt-1 text-xs font-medium text-brown-dark">
                  {stats.newSubmissionsCount} nieuw
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-sm border border-line bg-paper p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">Recente aanvragen</h2>
            <Link href="/admin/submissions" className="text-sm text-brown hover:text-brown-dark">
              Alles bekijken
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-ink-soft">Er zijn nog geen aanvragen.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentSubmissions.map((submission) => (
                <li key={submission.id}>
                  <Link
                    href={`/admin/submissions/${submission.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{submission.name}</p>
                      <p className="truncate text-xs text-ink-soft">
                        {submission.shoot_name_snapshot ?? "Geen shoot opgegeven"} &middot;{" "}
                        {formatDateTime(submission.created_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[submission.status]}`}
                    >
                      {STATUS_LABELS[submission.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-sm border border-line bg-paper p-6">
          <h2 className="mb-4 font-serif text-lg text-ink">Snelle acties</h2>
          <ul className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.label}>
                  <Link
                    href={action.href}
                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-blush-soft/60 hover:text-ink"
                  >
                    <Icon size={16} className="text-brown" />
                    {action.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
