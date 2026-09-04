import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { WIELSTRA_GROUP_URL } from "@/lib/constants/site";
import type { SiteSettings } from "@/lib/types/database.types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/over-mij", label: "Over mij" },
  { href: "/shoots", label: "Shoots" },
  { href: "/tarieven", label: "Tarieven" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-cream">
      <Container className="py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-xl font-medium text-ink">{settings.business_name}</p>
            {settings.tagline && <p className="mt-3 text-sm text-ink-soft">{settings.tagline}</p>}
          </div>

          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Navigatie</p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Contact</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
                >
                  <Mail size={16} /> {settings.email}
                </a>
              </li>
              {settings.instagram_url && (
                <li>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
                  >
                    <InstagramIcon size={16} /> @{settings.instagram_handle}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Werkgebied</p>
            <p className="text-sm leading-relaxed text-ink-soft">
              {settings.location} &amp; {settings.service_area.join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start gap-4 border-t border-line pt-8 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.business_name}. Alle rechten voorbehouden. Website gemaakt door{" "}
            <a
              href={WIELSTRA_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline decoration-line underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown"
            >
              Wielstra Group
            </a>
            .
          </p>
          {settings.footer_text && <p>{settings.footer_text}</p>}
        </div>
      </Container>
    </footer>
  );
}
