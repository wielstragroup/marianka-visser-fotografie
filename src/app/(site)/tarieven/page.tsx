import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { TravelCostNote } from "@/components/pricing/TravelCostNote";
import { Button } from "@/components/ui/Button";
import { getSiteSettings, getVisiblePricingPackages } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Tarieven",
  description: "Bekijk de tarieven van Marianka Visser Fotografie voor een fotoshoot in Friesland, Groningen, Drenthe of Overijssel.",
  alternates: { canonical: "/tarieven" },
};

export default async function TarievenPage() {
  const [packages, settings] = await Promise.all([getVisiblePricingPackages(), getSiteSettings()]);

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <SectionHeading
          eyebrow="Tarieven"
          title="Duidelijke pakketten"
          description="Eerlijke prijzen, zonder verrassingen achteraf. Twijfel je welk pakket het beste bij jouw shoot past? Neem gerust contact op."
        />

        <div className="mt-14">
          <PricingGrid packages={packages} />
          <TravelCostNote text={settings.travel_cost_text} />
        </div>

        <div className="mt-16 text-center">
          <Button href="/contact">Plan een shoot</Button>
        </div>
      </Container>
    </section>
  );
}
