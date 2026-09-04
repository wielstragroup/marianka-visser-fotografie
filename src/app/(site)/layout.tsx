import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getMediaById, getSiteSettings } from "@/lib/data/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const logo = settings.logo_media_id ? await getMediaById(settings.logo_media_id) : null;

  return (
    <>
      <Header businessName={settings.business_name} logo={logo} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
