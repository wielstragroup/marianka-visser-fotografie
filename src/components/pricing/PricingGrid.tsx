import { PricingCard } from "@/components/pricing/PricingCard";
import { Reveal } from "@/components/ui/Reveal";
import type { PricingPackage } from "@/lib/types/database.types";

export function PricingGrid({ packages }: { packages: PricingPackage[] }) {
  if (packages.length === 0) {
    return (
      <p className="text-center text-ink-soft">
        De tarieven worden binnenkort toegevoegd. Neem gerust contact op voor de mogelijkheden.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg, i) => (
        <Reveal key={pkg.id} delay={i * 80} className="h-full">
          <PricingCard pkg={pkg} />
        </Reveal>
      ))}
    </div>
  );
}
