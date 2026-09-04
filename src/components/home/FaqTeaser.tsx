import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Button } from "@/components/ui/Button";
import type { Faq } from "@/lib/types/database.types";

export function FaqTeaser({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  const shown = faqs.slice(0, 3);
  const hasMore = faqs.length > shown.length;

  return (
    <section className="py-24 sm:py-32">
      <Container size="narrow">
        <SectionHeading align="center" eyebrow="Veelgestelde vragen" title="Nog even dit" className="mx-auto" />

        <div className="mt-14">
          <FaqAccordion faqs={shown} />
        </div>

        {hasMore && (
          <div className="mt-10 text-center">
            <Button href="/faq" variant="secondary">
              Alle vragen bekijken
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
