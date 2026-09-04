import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ShootCard } from "@/components/shoots/ShootCard";
import { getMediaById, getVisibleShoots } from "@/lib/data/public";
import type { Media } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Shoots",
  description:
    "Bekijk de fotoshoots van Marianka Visser Fotografie: loveshoot, zwangerschapsshoot, newbornshoot, gezinsshoot en familieshoot.",
  alternates: { canonical: "/shoots" },
};

export default async function ShootsPage() {
  const shoots = await getVisibleShoots();

  const imageIds = shoots.map((s) => s.featured_image_id).filter((id): id is string => Boolean(id));
  const fetched = await Promise.all(imageIds.map((id) => getMediaById(id)));
  const mediaById = new Map<string, Media | null>(imageIds.map((id, i) => [id, fetched[i]]));

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <SectionHeading
          eyebrow="Fotoshoots"
          title="Voor elk bijzonder moment"
          description="Van een teder liefdesverhaal tot de eerste dagen van een nieuw leven — elke shoot is op maat, met alle tijd en aandacht voor jullie verhaal."
        />

        {shoots.length === 0 ? (
          <p className="mt-14 text-ink-soft">De shoots worden binnenkort toegevoegd.</p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {shoots.map((shoot, i) => (
              <Reveal key={shoot.id} delay={(i % 3) * 80}>
                <ShootCard
                  shoot={shoot}
                  image={shoot.featured_image_id ? mediaById.get(shoot.featured_image_id) ?? null : null}
                />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
