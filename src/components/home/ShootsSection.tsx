import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ShootCard } from "@/components/shoots/ShootCard";
import type { Media, Shoot } from "@/lib/types/database.types";

type GridItem = { type: "shoot"; shoot: Shoot } | { type: "quote" };

export function ShootsSection({
  shoots,
  images,
  quote,
}: {
  shoots: Shoot[];
  images: Map<string, Media | null>;
  quote: string;
}) {
  if (shoots.length === 0) return null;

  // The quote sits between the shoot right before "Familie" and the
  // Familie shoot itself, pushing Familie one grid position to the right —
  // resolved by slug so it still works if the admin reorders shoots later.
  const items: GridItem[] = shoots.map((shoot) => ({ type: "shoot", shoot }));
  const familieIndex = items.findIndex((item) => item.type === "shoot" && item.shoot.slug === "familieshoot");
  if (quote && familieIndex > 0) {
    items.splice(familieIndex, 0, { type: "quote" });
  }

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Fotoshoots"
          title="Voor elk bijzonder moment"
          description="Van een teder liefdesverhaal tot de eerste dagen van een nieuw leven — elke shoot is op maat."
        />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) =>
            item.type === "shoot" ? (
              <Reveal key={item.shoot.id} delay={(i % 3) * 80}>
                <ShootCard shoot={item.shoot} image={images.get(item.shoot.id) ?? null} />
              </Reveal>
            ) : (
              <Reveal key="quote" delay={(i % 3) * 80} className="h-full">
                <blockquote className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-sm border border-line bg-blush-soft px-8 py-10 text-center">
                  <span className="mb-4 font-serif text-5xl leading-none text-brown" aria-hidden="true">
                    &ldquo;
                  </span>
                  <p className="font-serif text-xl italic leading-relaxed text-ink sm:text-2xl">{quote}</p>
                </blockquote>
              </Reveal>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
