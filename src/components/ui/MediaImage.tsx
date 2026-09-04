import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types/database.types";

// Renders a `media` row as a responsive, optimized <Image>. Centralizing
// this means every place a photo is shown gets the same lazy-loading,
// sizing, and alt-text handling for free.
export function MediaImage({
  media,
  className,
  sizes = "100vw",
  priority = false,
  fill = true,
}: {
  media: Pick<Media, "url" | "alt_text" | "width" | "height" | "title"> &
    Partial<Pick<Media, "focal_x" | "focal_y" | "zoom">>;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const alt = media.alt_text || media.title || "";

  if (fill) {
    // Focal point (%) + zoom, CMS-editable per photo (see
    // admin/HeroPositionEditor.tsx). Defaults of 50/50/1 are a no-op, so
    // photos without an explicit position render exactly as plain
    // object-cover did before this existed.
    const focalX = media.focal_x ?? 50;
    const focalY = media.focal_y ?? 50;
    const zoom = media.zoom ?? 1;

    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={media.url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{
            objectPosition: `${focalX}% ${focalY}%`,
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: `${focalX}% ${focalY}%`,
          }}
        />
      </div>
    );
  }

  return (
    <Image
      src={media.url}
      alt={alt}
      width={media.width ?? 1200}
      height={media.height ?? 1500}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
