import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="bg-ink py-24 sm:py-32">
      <Container size="narrow">
        <Reveal className="text-center">
          <h2 className="font-serif text-3xl font-medium leading-tight text-cream sm:text-4xl md:text-5xl">
            Een mooi moment vastleggen?
          </h2>
          <p className="mt-4 text-base text-cream/80 sm:text-lg">
            Ik hoor graag wat je in gedachten hebt.
          </p>
          <div className="mt-8">
            <Button
              href="/contact"
              className="bg-cream text-ink border-cream hover:bg-transparent hover:text-cream"
            >
              Aanmelden
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
