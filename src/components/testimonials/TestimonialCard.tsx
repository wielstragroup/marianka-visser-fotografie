import { MediaImage } from "@/components/ui/MediaImage";
import { Stars } from "@/components/testimonials/Stars";
import { formatDayMonthYear } from "@/lib/utils";
import type { Media, Testimonial } from "@/lib/types/database.types";

// Review text is rendered as a plain React text node, which escapes it. Never
// switch this to dangerouslySetInnerHTML: the content comes from visitors.
export function TestimonialCard({
  testimonial,
  avatar,
}: {
  testimonial: Testimonial;
  avatar?: Media | null;
}) {
  const details = [
    testimonial.shoot_type,
    testimonial.approved_at ? formatDayMonthYear(testimonial.approved_at) : null,
  ].filter(Boolean);

  return (
    <figure className="flex h-full flex-col">
      {testimonial.rating && (
        <div className="mb-3">
          <Stars rating={testimonial.rating} />
        </div>
      )}
      <blockquote className="font-serif text-lg leading-relaxed wrap-anywhere whitespace-pre-line text-ink italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {avatar && <MediaImage media={avatar} sizes="48px" className="h-12 w-12 shrink-0 rounded-full" />}
        <span className="min-w-0 wrap-anywhere">
          <span className="block text-sm font-medium text-ink-soft">{testimonial.name}</span>
          {details.length > 0 && <span className="block text-xs text-ink-soft">{details.join(" · ")}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
