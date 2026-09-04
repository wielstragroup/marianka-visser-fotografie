"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Media } from "@/lib/types/database.types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/over-mij", label: "Over mij" },
  { href: "/shoots", label: "Shoots" },
  { href: "/tarieven", label: "Tarieven" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header({ businessName, logo }: { businessName: string; logo: Media | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const isHome = pathname === "/";

  // Close the mobile menu on navigation. Adjusting state during render in
  // response to a changed prop (rather than in an effect) avoids the extra
  // render pass an effect-based reset would cause.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setIsScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !isScrolled && !isOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        transparent ? "bg-transparent" : "bg-cream/95 backdrop-blur-sm shadow-[0_1px_0_0_var(--color-line)]"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        {/* A single uploaded logo has to work on both the transparent (dark
            hero) and solid-cream header states — pick a light/neutral logo
            when uploading one. Falls back to the text wordmark, which does
            adapt per state, until a logo is set. */}
        <Link href="/" className="min-w-0 shrink" aria-label={businessName}>
          {logo ? (
            <span className="relative block h-10 w-32 sm:h-12 sm:w-40">
              <Image
                src={logo.url}
                alt={logo.alt_text || businessName}
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </span>
          ) : (
            <span
              className={cn(
                "block truncate font-serif text-base font-medium tracking-wide transition-colors sm:text-lg",
                transparent ? "text-cream" : "text-ink"
              )}
            >
              {businessName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors",
                transparent ? "text-cream/90 hover:text-cream" : "text-ink-soft hover:text-ink",
                pathname === link.href && (transparent ? "text-cream" : "text-ink")
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 md:block">
          <Button
            href="/contact"
            variant={transparent ? "secondary" : "primary"}
            className={transparent ? "border-cream text-cream hover:bg-cream hover:text-ink" : undefined}
          >
            Aanmelden
          </Button>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Sluit menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            "-mr-2 flex h-10 w-10 shrink-0 items-center justify-center md:hidden",
            transparent ? "text-cream" : "text-ink"
          )}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-line bg-cream px-6 py-6 md:hidden">
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-serif text-2xl text-ink hover:text-brown"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href="/contact" className="mt-6 w-full">
            Aanmelden
          </Button>
        </nav>
      )}
    </header>
  );
}
