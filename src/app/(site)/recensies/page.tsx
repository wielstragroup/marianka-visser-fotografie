import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { getMediaById, getPublishedTestimonials, getVisibleShoots } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Recensies",
  description: "Lees de ervaringen van klanten van Marianka Visser Fotografie, of deel je eigen ervaring.",
  alternates: { canonical: "/recensies" },
};

export default async function RecensiesPage() {
  const [testimonials, shoots] = await Promise.all([getPublishedTestimonials(), getVisibleShoots()]);

  const avatarIds = [...new Set(testimonials.flatMap((t) => t.avatar_media_id ?? []))];
  const avatars = new Map(
    await Promise.all(avatarIds.map(async (id) => [id, await getMediaById(id)] as const))
  );

  return (
    <>
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Recensies"
            title="Wat klanten zeggen"
            description="Lees de ervaringen van klanten, of deel je eigen ervaring."
            className="mx-auto"
          />

          <div className="mt-8 text-center">
            <Button href="#recensie-schrijven">Schrijf een recensie</Button>
          </div>

          {testimonials.length === 0 ? (
            <p className="mt-14 text-center text-ink-soft">
              Er staan nog geen recensies op de website. Schrijf jij de eerste?
            </p>
          ) : (
            <div className="mx-auto mt-16 grid max-w-5xl gap-12 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={(i % 2) * 80}>
                  <TestimonialCard
                    testimonial={t}
                    avatar={t.avatar_media_id ? avatars.get(t.avatar_media_id) : null}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section id="recensie-schrijven" className="scroll-mt-20 bg-blush-soft/40 py-20 sm:py-24">
        <Container size="narrow">
          <SectionHeading
            align="center"
            eyebrow="Jouw ervaring"
            title="Schrijf een recensie"
            description="Ik lees elke recensie persoonlijk en plaats hem daarna op de website."
            className="mx-auto"
          />
          <div className="mt-12">
            <ReviewForm shootTypes={shoots.map((s) => s.name)} />
          </div>
        </Container>
      </section>
    </>
  );
}
