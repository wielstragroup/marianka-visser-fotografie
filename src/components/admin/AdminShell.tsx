"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="relative z-10">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
          <span className="font-serif text-base text-ink">Marianka Visser — Dashboard</span>
          <button
            type="button"
            aria-label={isOpen ? "Sluit menu" : "Open menu"}
            onClick={() => setIsOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center text-ink"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className="hidden items-center justify-end border-b border-line bg-paper px-8 py-3 md:flex">
          <span className="text-sm text-ink-soft">Ingelogd als {adminName}</span>
        </div>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
