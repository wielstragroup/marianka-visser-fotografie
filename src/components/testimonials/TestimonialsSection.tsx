import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import type { Media, Testimonial } from "@/lib/types/database.types";

// Generic, reusable across any client site: renders nothing unless the
// section is both enabled in settings AND has at least one published entry,
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
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 80}>
              <TestimonialCard
                testimonial={t}
                avatar={t.avatar_media_id ? avatars.get(t.avatar_media_id) : null}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button href="/recensies" variant="secondary">
            Alle recensies
          </Button>
        </div>
      </Container>
    </section>
  );
}
