import { cn, formatPrice } from "@/lib/utils";
import type { PricingPackage } from "@/lib/types/database.types";

export function PricingCard({ pkg }: { pkg: PricingPackage }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-sm border p-8",
        pkg.is_featured ? "border-brown bg-paper shadow-sm" : "border-line bg-paper/60"
      )}
    >
      {pkg.is_featured && (
        <span className="mb-4 inline-block w-fit rounded-full bg-blush px-3 py-1 text-xs font-medium tracking-wide text-brown-dark">
          Populair
        </span>
      )}
      <h3 className="font-serif text-2xl text-ink">{pkg.name}</h3>
      <p className="mt-2 font-serif text-4xl font-medium text-ink">{formatPrice(pkg.price)}</p>
      {pkg.photo_count && (
        <p className="mt-1 text-sm text-ink-soft">{pkg.photo_count} bewerkte foto&apos;s</p>
      )}
      {pkg.description && (
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">{pkg.description}</p>
      )}
      {pkg.extra_info && (
        <p className="mt-auto pt-6 text-xs text-ink-soft/80">{pkg.extra_info}</p>
      )}
    </div>
  );
}
