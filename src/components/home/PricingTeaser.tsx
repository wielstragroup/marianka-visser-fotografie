import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { TravelCostNote } from "@/components/pricing/TravelCostNote";
import type { PricingPackage } from "@/lib/types/database.types";

export function PricingTeaser({
  packages,
  travelCostText,
}: {
  packages: PricingPackage[];
  travelCostText: string | null;
}) {
  return (
    <section className="bg-blush-soft py-24 sm:py-32">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Tarieven"
          title="Duidelijke pakketten"
          description="Eerlijke prijzen, zonder verrassingen achteraf."
          className="mx-auto"
        />

        <div className="mt-14">
          <PricingGrid packages={packages.slice(0, 3)} />
        </div>

        <TravelCostNote text={travelCostText} />
      </Container>
    </section>
  );
}
