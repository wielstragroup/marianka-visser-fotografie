"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-24">
      <Container size="narrow" className="text-center">
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">Er ging iets mis</p>
        <h1 className="font-serif text-4xl font-medium text-ink sm:text-5xl">Even iets misgegaan</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft sm:text-lg">
          Deze pagina kon niet worden geladen. Probeer het opnieuw, of ga terug naar de homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button onClick={() => reset()}>
            <RotateCw size={16} /> Probeer opnieuw
          </Button>
          <Button href="/" variant="secondary">
            Naar de homepage
          </Button>
        </div>
      </Container>
    </div>
  );
}
