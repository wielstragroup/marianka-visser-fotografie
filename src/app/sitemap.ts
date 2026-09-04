import type { MetadataRoute } from "next";
import { getVisibleShoots } from "@/lib/data/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mariankavisserfotografie.nl";
  const shoots = await getVisibleShoots().catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/over-mij`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/shoots`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/tarieven`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const shootRoutes: MetadataRoute.Sitemap = shoots.map((shoot) => ({
    url: `${siteUrl}/shoots/${shoot.slug}`,
    lastModified: shoot.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...shootRoutes];
}
