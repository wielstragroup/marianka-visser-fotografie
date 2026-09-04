import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { getAvailability, getSiteSettings, getVisibleShoots } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Contact & aanmelden",
  description: "Plan een fotoshoot bij Marianka Visser Fotografie. Vul het aanmeldformulier in en Marianka neemt snel contact met je op.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [shoots, availability, settings] = await Promise.all([
    getVisibleShoots(),
    getAvailability(),
    getSiteSettings(),
  ]);

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">Contact</p>
            <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Een mooi moment vastleggen?
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
              Vul het formulier in en ik neem zo snel mogelijk contact met je op om de mogelijkheden te
              bespreken.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 text-sm text-ink-soft hover:text-ink"
              >
                <Mail size={18} className="text-brown" /> {settings.email}
              </a>
              <p className="flex items-center gap-3 text-sm text-ink-soft">
                <MapPin size={18} className="text-brown" /> {settings.location} &middot; werkzaam in{" "}
                {settings.service_area.join(", ")}
              </p>
            </div>

            <div className="mt-12 rounded-sm border border-line bg-blush-soft/60 p-6">
              <p className="mb-4 text-xs font-medium tracking-[0.2em] text-brown uppercase">Beschikbaarheid</p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {availability.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-4">
                    <span>{slot.day_label}</span>
                    <span className={slot.is_available ? "text-ink" : "text-ink-soft/60"}>
                      {slot.is_available ? slot.moment_label : "Niet beschikbaar"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <ContactForm shoots={shoots} availability={availability} />
          </div>
        </div>
      </Container>
    </section>
  );
}
