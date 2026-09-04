import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import type { Media, Shoot } from "@/lib/types/database.types";

export function NewbornSection({ shoot, image }: { shoot: Shoot | null; image: Media | null }) {
  const title = shoot?.name ?? "Newbornfotografie";
  // Deliberately not shoot.short_description — that field now doubles as a
  // short tagline on the shoot card/detail page ("Puur & liefdevol"), which
  // would shrink this dedicated specialty blurb instead of strengthening it.
  const description =
    "Newbornfotografie is mijn specialiteit. Ik neem alle tijd om jouw kleintje op zijn gemak te stellen, zodat de puurste momenten vanzelf ontstaan.";

  return (
    <section className="bg-blush-soft py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 aspect-[4/5] w-full overflow-hidden rounded-sm lg:order-1">
            {image ? (
              <MediaImage
                media={image}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blush">
                <span className="font-serif text-lg text-brown-dark">Newbornfotografie</span>
              </div>
            )}
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={100}>
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">Specialiteit</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl md:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              {description}
            </p>
            <div className="mt-8">
              <Button href={shoot ? `/shoots/${shoot.slug}` : "/shoots"}>Meer over newborn</Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
