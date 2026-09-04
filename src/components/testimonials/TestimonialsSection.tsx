import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Media, Testimonial } from "@/lib/types/database.types";

// Generic, reusable across any client site: renders nothing unless the
// section is both enabled in settings AND has at least one visible entry,
// so an undecided/empty testimonials feature never shows a hollow section.
export function TestimonialsSection({
  testimonials,
  enabled,
  avatars,
}: {
  testimonials: Testimonial[];
  enabled: boolean;
  avatars: Map<string, Media | null>;
}) {
  if (!enabled || testimonials.length === 0) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container size="narrow">
        <SectionHeading align="center" eyebrow="Ervaringen" title="Wat klanten zeggen" className="mx-auto" />

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {testimonials.map((t, i) => {
            const avatar = t.avatar_media_id ? avatars.get(t.avatar_media_id) : null;
            return (
              <Reveal key={t.id} delay={i * 80}>
                <figure className="flex h-full flex-col">
                  {t.rating && (
                    <div className="mb-3 flex gap-0.5 text-brown">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          fill={idx < t.rating! ? "currentColor" : "none"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  )}
                  <blockquote className="font-serif text-lg leading-relaxed text-ink italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {avatar && (
                      <MediaImage
                        media={avatar}
                        sizes="40px"
                        className="h-10 w-10 shrink-0 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-ink-soft">{t.name}</span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
