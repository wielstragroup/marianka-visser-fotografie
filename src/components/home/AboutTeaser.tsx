import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import type { Media } from "@/lib/types/database.types";

export function AboutTeaser({ image, text }: { image: Media | null; text: string }) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="aspect-[4/5] w-full overflow-hidden rounded-sm">
            {image ? (
              <MediaImage media={image} sizes="(min-width: 1024px) 45vw, 100vw" className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blush-soft">
                <span className="font-serif text-lg text-brown-dark">Marianka Visser</span>
              </div>
            )}
          </Reveal>

          <Reveal delay={100}>
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">Wie is Marianka?</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl md:text-5xl">
              Hi hi, ik ben Marianka
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">{text}</p>
            <div className="mt-8">
              <Button href="/over-mij" variant="secondary">
                Meer over mij
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
