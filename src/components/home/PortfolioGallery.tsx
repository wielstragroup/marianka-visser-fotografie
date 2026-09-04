"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import { Lightbox } from "@/components/ui/Lightbox";
import type { Media } from "@/lib/types/database.types";

// CSS multi-column masonry: each photo keeps its own intrinsic aspect ratio
// (no forced crop) and columns balance naturally without a JS-measured grid.
export function PortfolioGallery({ media }: { media: Media[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="Portfolio"
          title="Een greep uit mijn werk"
          className="mx-auto"
        />

        <div className="mt-14 columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
          {media.map((item, i) => (
            <Reveal key={item.id} className="mb-4 break-inside-avoid sm:mb-5" delay={(i % 6) * 60}>
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Vergroot foto${item.title ? `: ${item.title}` : ""}`}
                className="group block w-full overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown"
              >
                <MediaImage
                  media={item}
                  fill={false}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="w-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      <Lightbox media={media} index={openIndex} onClose={() => setOpenIndex(null)} onIndexChange={setOpenIndex} />
    </section>
  );
}
