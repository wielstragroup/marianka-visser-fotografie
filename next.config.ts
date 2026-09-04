import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next.js 16 defaults `qualities` to [75] only. 75 stays the default
    // everywhere; 90 is used for the portfolio lightbox's large view (see
    // src/components/ui/Lightbox.tsx) so full-screen photos aren't visibly
    // softer than the thumbnails they were opened from.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // No serverActions.bodySizeLimit override needed: photo uploads go
  // straight from the browser to Supabase Storage (see
  // src/app/admin/(dashboard)/media/actions.ts), so no Server Action ever
  // receives a large file body. Every action here only ever handles small
  // form fields or JSON-shaped metadata, well under the 1MB default.
};

export default nextConfig;
