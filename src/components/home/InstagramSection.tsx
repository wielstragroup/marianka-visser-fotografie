import { InstagramIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

// A pure call-to-action to the real Instagram profile — deliberately no
// photo grid here. The portfolio already shows the same photos above; a
// second grid would just repeat them.
export function InstagramSection({ handle, url }: { handle: string | null; url: string | null }) {
  if (!handle || !url) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <InstagramIcon className="text-brown" size={28} />
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">Volg mij op Instagram</h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-brown hover:text-brown-dark"
          >
            @{handle}
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
