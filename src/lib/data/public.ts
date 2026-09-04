import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Faq, Media, Page, PricingPackage, Shoot, SiteSettings, Testimonial, Availability } from "@/lib/types/database.types";

// Read-only data access for the public site. Every query here relies on RLS
// (is_visible = true) already scoping the rows — these functions never
// bypass that, so a page simply rendering this data can't leak draft
// content.

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).single();

  // Falls back to sensible defaults if the singleton row is ever missing,
  // so the site never crashes on a fresh/unseeded database.
  return (
    data ?? {
      id: true,
      business_name: "Marianka Visser Fotografie",
      tagline: null,
      email: "info@mariankavisserfotografie.nl",
      phone: null,
      instagram_handle: "mariankavisser_fotografie",
      instagram_url: "https://www.instagram.com/mariankavisser_fotografie",
      domain: "mariankavisserfotografie.nl",
      location: "Damwâld",
      service_area: ["Friesland", "Groningen", "Drenthe", "Overijssel"],
      logo_media_id: null,
      favicon_media_id: null,
      footer_text: null,
      testimonials_enabled: false,
      seo_title_default: "Marianka Visser Fotografie",
      seo_description_default:
        "Fotograaf in Damwâld, actief in Friesland, Groningen, Drenthe en Overijssel.",
      og_image_media_id: null,
      travel_cost_text: "Reiskosten: €0,25 per km.",
      updated_at: new Date().toISOString(),
    }
  );
}

export async function getVisibleShoots(): Promise<Shoot[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("shoots")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getShootBySlug(slug: string): Promise<Shoot | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("shoots")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();
  return data ?? null;
}

export async function getMediaForShoot(shootId: string): Promise<Media[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("shoot_id", shootId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getMediaById(id: string): Promise<Media | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("media").select("*").eq("id", id).eq("is_visible", true).single();
  return data ?? null;
}

export async function getFeaturedMedia(limit = 12): Promise<Media[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return data ?? [];
}

export async function getMediaByCategory(category: string, limit = 1): Promise<Media[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("is_visible", true)
    .eq("category", category)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return data ?? [];
}

export async function getPortfolioMedia(limit = 24): Promise<Media[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return data ?? [];
}

export async function getVisiblePricingPackages(): Promise<PricingPackage[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getPricingPackagesForShoot(shootId: string): Promise<PricingPackage[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("is_visible", true)
    .eq("shoot_id", shootId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getVisibleFaqs(): Promise<Faq[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getVisibleTestimonials(): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAvailability(): Promise<Availability[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("availability")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getPage(slug: string): Promise<Page | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).single();
  return data ?? null;
}
