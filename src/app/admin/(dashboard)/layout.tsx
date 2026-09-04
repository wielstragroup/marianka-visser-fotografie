import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard",
  },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return <AdminShell adminName={profile.full_name || profile.email}>{children}</AdminShell>;
}
