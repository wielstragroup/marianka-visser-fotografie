import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getMediaByCategory, getPage, getSiteSettings } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("over-mij");
  return {
    title: page?.seo_title ?? "Over mij",
    description:
      page?.seo_description ??
      "Maak kennis met Marianka, fotograaf in Damwâld en actief in Friesland, Groningen, Drenthe en Overijssel.",
    alternates: { canonical: "/over-mij" },
  };
}

const DEFAULT_PARAGRAPHS = [
  "Hi! Ik ben Marianka, 25 jaar, en ik woon in Noord-Friesland.",
  "Ik woon nog gezellig thuis bij mijn ouders, samen met mijn broer en zus. Daarnaast heb ik een lieve vriend.",
  "In het dagelijks leven werk ik in de kinderopvang, een baan waar ik ontzettend veel plezier uit haal. Ik ben gek op kinderen en vind het mooi om hun puurheid en spontaniteit te zien.",
  "Fotografie is eigenlijk al iets wat van jongs af aan bij mij past. Als klein meisje was ik altijd al bezig met foto's maken. Het vastleggen van mooie momenten vond ik toen al ontzettend leuk.",
  "Op een gegeven moment begon het weer te kriebelen om een leuke hobby op te pakken. Daarom besloot ik een online opleiding fotografie te gaan volgen. Inmiddels ben ik volop bezig met het maken van verschillende fotoshoots en leer ik iedere keer weer nieuwe dingen. Want door te doen leer ik!",
  "Ik geniet enorm van het fotograferen. Ik vind het bijzonder dat ik een klein stukje van iemands leven mag vastleggen en daar herinneringen van mag maken.",
  "Mijn liefde voor kinderen, mijn passie voor fotografie en mijn enthousiasme komen hierin allemaal samen.",
  "Mijn grootste doel? Momenten creëren die je voor altijd kunt bewaren.",
  "Kom jij ook voor mijn lens staan? Het lijkt mij leuk!",
];

export default async function OverMijPage() {
  const [image, page, settings] = await Promise.all([
    getMediaByCategory("portret", 1),
    getPage("over-mij"),
    getSiteSettings(),
  ]);

  const content = page?.content as { paragraphs?: string[] } | null;
  const paragraphs = content?.paragraphs?.length ? content.paragraphs : DEFAULT_PARAGRAPHS;
  const portrait = image[0] ?? null;

  return (
    <>
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal className="order-2 aspect-[4/5] w-full overflow-hidden rounded-sm lg:order-1 lg:sticky lg:top-32 lg:self-start">
              {portrait ? (
                <MediaImage media={portrait} sizes="(min-width: 1024px) 40vw, 100vw" className="h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blush-soft">
                  <span className="font-serif text-lg text-brown-dark">Marianka Visser</span>
                </div>
              )}
            </Reveal>

            <div className="order-1 lg:order-2">
              <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">Over mij</p>
              <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl md:text-6xl">
                Hi hi, ik ben Marianka
              </h1>

              <div className="mt-8 space-y-5">
                {paragraphs.map((p, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <p className="text-base leading-relaxed text-ink-soft sm:text-lg">{p}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={paragraphs.length * 60} className="mt-10 rounded-sm border border-line bg-blush-soft/60 p-6">
                <p className="text-sm leading-relaxed text-ink-soft">
                  Ik werk vanuit {settings.location} en reis door {settings.service_area.join(", ")} om
                  jouw shoot vast te leggen.
                </p>
              </Reveal>

              <div className="mt-10">
                <Button href="/contact">Plan een shoot</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
