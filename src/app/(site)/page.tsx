import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { IntroSection } from "@/components/home/IntroSection";
import { NewbornSection } from "@/components/home/NewbornSection";
import { ShootsSection } from "@/components/home/ShootsSection";
import { PortfolioGallery } from "@/components/home/PortfolioGallery";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { InstagramSection } from "@/components/home/InstagramSection";
import { FinalCta } from "@/components/home/FinalCta";
import {
  getSiteSettings,
  getVisibleShoots,
  getMediaByCategory,
  getMediaById,
  getFeaturedMedia,
  getVisiblePricingPackages,
  getVisibleFaqs,
  getVisibleTestimonials,
  getPage,
} from "@/lib/data/public";
import type { Media } from "@/lib/types/database.types";

const DEFAULT_INTRO_TEXT = "Ik leg de momenten vast die er écht toe doen.";

const DEFAULT_ABOUT_TEASER_TEXT =
  "Vanuit Damwâld fotografeer ik met veel plezier de momenten die je later opnieuw wilt beleven. Van een klein, nieuw gezinnetje tot een groot familiefeest: ik leg ze vast zoals ze echt zijn.";

const DEFAULT_SHOOTS_QUOTE = "De mooiste foto's ontstaan op de momenten dat je gewoon jezelf bent.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");

  return {
    title: page?.seo_title ?? "Fotograaf in Damwâld en Noord-Nederland",
    description:
      page?.seo_description ??
      "Marianka Visser Fotografie legt pure momenten en warme herinneringen vast in Friesland, Groningen, Drenthe en Overijssel. Gespecialiseerd in newbornfotografie.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [settings, shoots, heroImages, aboutImages, portfolioMedia, packages, faqs, testimonials, homePage] =
    await Promise.all([
      getSiteSettings(),
      getVisibleShoots(),
      getMediaByCategory("hero", 1),
      getMediaByCategory("portret", 1),
      getFeaturedMedia(10),
      getVisiblePricingPackages(),
      getVisibleFaqs(),
      getVisibleTestimonials(),
      getPage("home"),
    ]);

  const homeContent = homePage?.content as
    | { intro_text?: string; about_teaser_text?: string; shoots_quote?: string }
    | null;
  const introText = homeContent?.intro_text || DEFAULT_INTRO_TEXT;
  const aboutTeaserText = homeContent?.about_teaser_text || DEFAULT_ABOUT_TEASER_TEXT;
  const shootsQuote = homeContent?.shoots_quote || DEFAULT_SHOOTS_QUOTE;

  const newbornShoot = shoots.find((s) => s.is_specialty) ?? null;

  const shootImageIds = shoots.map((s) => s.featured_image_id).filter((id): id is string => Boolean(id));
  const testimonialAvatarIds = testimonials
    .map((t) => t.avatar_media_id)
    .filter((id): id is string => Boolean(id));
  const newbornImageId = newbornShoot?.featured_image_id ?? null;

  const idsToFetch = Array.from(
    new Set([...shootImageIds, ...testimonialAvatarIds, ...(newbornImageId ? [newbornImageId] : [])])
  );
  const fetchedMedia = await Promise.all(idsToFetch.map((id) => getMediaById(id)));
  const mediaById = new Map<string, Media | null>(idsToFetch.map((id, i) => [id, fetchedMedia[i]]));

  const shootImages = new Map<string, Media | null>(
    shoots.map((s) => [s.id, s.featured_image_id ? mediaById.get(s.featured_image_id) ?? null : null])
  );
  const testimonialAvatars = new Map<string, Media | null>(
    testimonialAvatarIds.map((id) => [id, mediaById.get(id) ?? null])
  );
  const newbornImage = newbornImageId ? mediaById.get(newbornImageId) ?? null : null;

  return (
    <>
      <Hero
        image={heroImages[0] ?? null}
        title={settings.business_name}
        subtitle={settings.tagline ?? "Pure momenten, warme herinneringen."}
      />

      <IntroSection text={introText} />

      <NewbornSection shoot={newbornShoot} image={newbornImage} />

      <ShootsSection shoots={shoots} images={shootImages} quote={shootsQuote} />

      <PortfolioGallery media={portfolioMedia} />

      <AboutTeaser image={aboutImages[0] ?? null} text={aboutTeaserText} />

      <PricingTeaser packages={packages} travelCostText={settings.travel_cost_text} />

      <TestimonialsSection
        testimonials={testimonials}
        enabled={settings.testimonials_enabled}
        avatars={testimonialAvatars}
      />

      <FaqTeaser faqs={faqs} />

      <InstagramSection handle={settings.instagram_handle} url={settings.instagram_url} />

      <FinalCta />
    </>
  );
}
