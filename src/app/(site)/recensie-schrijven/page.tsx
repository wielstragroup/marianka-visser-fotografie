import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { getVisibleShoots } from "@/lib/data/public";

// Direct link for sending to clients via WhatsApp or e-mail. Kept out of
// search results: /recensies is the page that should rank.
export const metadata: Metadata = {
  title: "Schrijf een recensie",
  description: "Deel je ervaring met Marianka Visser Fotografie.",
  alternates: { canonical: "/recensie-schrijven" },
  robots: { index: false, follow: true },
};

export default async function RecensieSchrijvenPage() {
  const shoots = await getVisibleShoots();

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container size="narrow">
        <SectionHeading
          align="center"
          eyebrow="Jouw ervaring"
          title="Schrijf een recensie"
          description="Fijn dat je je ervaring wilt delen! Ik lees elke recensie persoonlijk en plaats hem daarna op de website."
          className="mx-auto"
        />
        <div className="mt-12">
          <ReviewForm shootTypes={shoots.map((s) => s.name)} />
        </div>
      </Container>
    </section>
  );
}
