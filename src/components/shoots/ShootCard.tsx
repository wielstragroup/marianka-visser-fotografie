import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Media, Shoot } from "@/lib/types/database.types";

export function ShootCard({ shoot, image }: { shoot: Shoot; image: Media | null }) {
  return (
    <Link href={`/shoots/${shoot.slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-blush-soft">
        {image ? (
          <MediaImage
            media={image}
            // Intentionally ~2x the card's actual CSS width: `sizes` only
            // tells next/image how wide the box is, not that object-cover
            // has to blow a photo up further to fill this portrait (3:4)
            // card's height too. Without the headroom, a wide/landscape
            // source photo (e.g. cropped from the top with a low focal_y)
            // gets fetched at a width-only resolution, then stretched
            // vertically by the browser to cover the box — visibly blurry.
            sizes="(min-width: 1024px) 60vw, (min-width: 640px) 90vw, 180vw"
            className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-lg text-brown-dark">{shoot.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-ink">{shoot.name}</h3>
        <ArrowUpRight
          size={20}
          className="text-ink-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-brown"
        />
      </div>
      {shoot.short_description && (
        <p className="mt-1 text-sm text-ink-soft">{shoot.short_description}</p>
      )}
    </Link>
  );
}
