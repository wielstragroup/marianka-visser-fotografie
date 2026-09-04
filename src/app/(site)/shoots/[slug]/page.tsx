import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { TravelCostNote } from "@/components/pricing/TravelCostNote";
import {
  getMediaById,
  getMediaForShoot,
  getPricingPackagesForShoot,
  getShootBySlug,
  getSiteSettings,
  getVisibleShoots,
} from "@/lib/data/public";

export async function generateStaticParams() {
  // Falls back to an empty list (pages render on-demand instead) if the
  // database isn't reachable at build time — e.g. a preview build before
  // Supabase env vars are configured — rather than failing the whole build.
  try {
    const shoots = await getVisibleShoots();
    return shoots.map((shoot) => ({ slug: shoot.slug }));
  } catch (error) {
    console.warn("[shoots] generateStaticParams kon shoots niet ophalen:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shoot = await getShootBySlug(slug);
  if (!shoot) return {};

  const title = shoot.seo_title ?? shoot.name;
  const description = shoot.seo_description ?? shoot.short_description ?? undefined;
  const featuredImage = shoot.featured_image_id ? await getMediaById(shoot.featured_image_id) : null;

  return {
    title,
    description,
    alternates: { canonical: `/shoots/${shoot.slug}` },
    openGraph: {
      title,
      description,
      images: featuredImage ? [{ url: featuredImage.url, alt: featuredImage.alt_text || shoot.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: featuredImage ? [featuredImage.url] : undefined,
    },
  };
}

export default async function ShootDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shoot = await getShootBySlug(slug);
  if (!shoot) notFound();

  const [gallery, featuredImage, packages, settings] = await Promise.all([
    getMediaForShoot(shoot.id),
    shoot.featured_image_id ? getMediaById(shoot.featured_image_id) : Promise.resolve(null),
    getPricingPackagesForShoot(shoot.id),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="relative flex h-[70vh] min-h-[420px] w-full items-end overflow-hidden bg-ink">
        {featuredImage ? (
          <MediaImage media={featuredImage} priority sizes="100vw" className="absolute inset-0 h-full w-full" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, #4a3a2c 0%, #6b503a 45%, #9c7a5c 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
        <div className="relative z-10 w-full px-6 pb-14 sm:px-8 lg:px-12">
          <Container className="!px-0">
            {shoot.is_specialty && (
              <p className="mb-3 text-xs font-medium tracking-[0.2em] text-cream/90 uppercase">Specialiteit</p>
            )}
            <h1 className="font-serif text-4xl font-medium text-cream sm:text-6xl">{shoot.name}</h1>
            {shoot.short_description && (
              <p className="mt-3 text-base font-medium text-cream/90 sm:text-lg">{shoot.short_description}</p>
            )}
          </Container>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <Container size="narrow">
          <Reveal>
            {shoot.long_description ? (
              <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">
                {shoot.long_description}
              </p>
            ) : shoot.short_description ? (
              <p className="text-lg leading-relaxed text-ink-soft">{shoot.short_description}</p>
            ) : null}
          </Reveal>
          {shoot.duration_label && (
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
              <Clock size={16} className="text-brown" /> Duur: {shoot.duration_label}
            </p>
          )}
          <div className="mt-10">
            <Button href={shoot.cta_url ?? "/contact"}>{shoot.cta_label ?? "Plan een shoot"}</Button>
          </div>
        </Container>
      </section>

      {gallery.length > 0 && (
        <section className="pb-24 sm:pb-32">
          <Container size="wide">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {gallery.map((item, i) => {
                const isWide = i % 5 === 0;
                return (
                  <Reveal
                    key={item.id}
                    delay={(i % 6) * 60}
                    className={isWide ? "col-span-2 aspect-[16/10] sm:col-span-2" : "aspect-[4/5]"}
                  >
                    <MediaImage
                      media={item}
                      // Must match the actual rendered width of the grid
                      // cell above: a col-span-2 tile is ~2x wider than a
                      // normal one (full row width below `sm`, ~2/3 of it
                      // from `sm` up, where the grid switches from 2 to 3
                      // columns). A mismatched (too-small) `sizes` value
                      // makes next/image pick an undersized srcset
                      // candidate that the browser then has to stretch via
                      // CSS to fill the real box — the actual cause of the
                      // visible blur on wide tiles, not a quality/format
                      // issue.
                      sizes={isWide ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 640px) 33vw, 50vw"}
                      className="h-full w-full rounded-sm"
                    />
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {packages.length > 0 && (
        <section className="bg-blush-soft py-24 sm:py-32">
          <Container>
            <h2 className="mb-12 text-center font-serif text-3xl font-medium text-ink sm:text-4xl">
              Tarieven voor deze shoot
            </h2>
            <PricingGrid packages={packages} />
            <TravelCostNote text={settings.travel_cost_text} />
          </Container>
        </section>
      )}
    </>
  );
}
