import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { getVisibleFaqs } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Antwoorden op veelgestelde vragen over shoots, levertijd en het werkgebied van Marianka Visser Fotografie.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getVisibleFaqs();

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container size="narrow">
        <SectionHeading
          align="center"
          eyebrow="Veelgestelde vragen"
          title="Nog even dit"
          className="mx-auto"
        />

        <div className="mt-14">
          <FaqAccordion faqs={faqs} />
        </div>

        <div className="mt-14 text-center">
          <p className="mb-5 text-ink-soft">Staat je vraag er niet bij?</p>
          <Button href="/contact">Neem contact op</Button>
        </div>
      </Container>
    </section>
  );
}
