import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

export function IntroSection({ text }: { text: string }) {
  return (
    <section className="py-20 sm:py-28">
      <Container size="narrow">
        <Reveal className="text-center">
          <p className="font-serif text-2xl leading-relaxed text-ink sm:text-3xl md:text-[2.25rem] md:leading-[1.5]">
            {text}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
