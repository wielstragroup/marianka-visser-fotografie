import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { getMediaById, getSiteSettings } from "@/lib/data/public";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mariankavisserfotografie.nl";

  const [favicon, ogImage] = await Promise.all([
    settings.favicon_media_id ? getMediaById(settings.favicon_media_id) : Promise.resolve(null),
    settings.og_image_media_id ? getMediaById(settings.og_image_media_id) : Promise.resolve(null),
  ]);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.seo_title_default ?? settings.business_name,
      template: `%s — ${settings.business_name}`,
    },
    description: settings.seo_description_default ?? undefined,
    icons: favicon ? { icon: favicon.url } : undefined,
    openGraph: {
      title: settings.seo_title_default ?? settings.business_name,
      description: settings.seo_description_default ?? undefined,
      siteName: settings.business_name,
      locale: "nl_NL",
      type: "website",
      images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt_text || settings.business_name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage.url] : undefined,
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${fraunces.variable} ${workSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
