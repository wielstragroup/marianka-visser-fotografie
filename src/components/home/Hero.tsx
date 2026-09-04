import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Media } from "@/lib/types/database.types";

export function Hero({ image, title, subtitle }: { image: Media | null; title: string; subtitle: string }) {
  return (
    <section className="relative flex h-[92vh] min-h-[560px] w-full items-end overflow-hidden bg-ink">
      {image ? (
        <MediaImage media={image} priority sizes="100vw" className="absolute inset-0" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #4a3a2c 0%, #6b503a 45%, #9c7a5c 100%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />

      <div className="relative z-10 w-full px-6 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.1] text-cream sm:text-6xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-base text-cream/90 sm:text-lg">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/shoots" variant="primary" className="bg-cream text-ink border-cream hover:bg-transparent hover:text-cream">
              Bekijk mijn werk
            </Button>
            <Button href="/contact" variant="secondary" className="border-cream text-cream hover:bg-cream hover:text-ink">
              Plan een shoot
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
