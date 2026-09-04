import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-24">
      <Container size="narrow" className="text-center">
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">404</p>
        <h1 className="font-serif text-4xl font-medium text-ink sm:text-5xl">Pagina niet gevonden</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft sm:text-lg">
          Deze pagina bestaat niet (meer). Misschien is hij verplaatst of verwijderd.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/">Naar de homepage</Button>
          <Button href="/shoots" variant="secondary">
            Bekijk de shoots
          </Button>
        </div>
        <p className="mt-10 text-sm text-ink-soft">
          Heb je een vraag? <Link href="/contact" className="text-brown hover:text-brown-dark">Neem contact op</Link>.
        </p>
      </Container>
    </div>
  );
}
