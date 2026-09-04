"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Camera,
  Tag,
  HelpCircle,
  Star,
  Inbox,
  CalendarClock,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/media", label: "Foto's", icon: ImageIcon },
  { href: "/admin/shoots", label: "Shoots", icon: Camera },
  { href: "/admin/pricing", label: "Tarieven", icon: Tag },
  { href: "/admin/faq", label: "Veelgestelde vragen", icon: HelpCircle },
  { href: "/admin/testimonials", label: "Recensies", icon: Star },
  { href: "/admin/submissions", label: "Aanvragen", icon: Inbox },
  { href: "/admin/availability", label: "Beschikbaarheid", icon: CalendarClock },
  { href: "/admin/pages", label: "Pagina's", icon: FileText },
  { href: "/admin/settings", label: "Instellingen", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-paper">
      <div className="px-6 py-6">
        <p className="font-serif text-lg text-ink">Marianka Visser</p>
        <p className="text-xs text-ink-soft">Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-blush-soft text-ink" : "text-ink-soft hover:bg-blush-soft/60 hover:text-ink"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-blush-soft/60 hover:text-ink"
          >
            <LogOut size={18} /> Uitloggen
          </button>
        </form>
      </div>
    </aside>
  );
}
