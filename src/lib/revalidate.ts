import "server-only";
import { revalidatePath } from "next/cache";

// Admin/CMS mutations are infrequent and the public site is small, so a
// full-site revalidation is cheap — and it's the officially documented
// pattern for "revalidate everything" (see the Next.js revalidatePath
// docs). Using this everywhere instead of hand-picking affected paths per
// module avoids an entire class of bugs: a renamed shoot slug, a
// pricing package moved to a different shoot, or a photo relinked to
// another shoot would otherwise leave a stale statically-generated page
// behind unless every admin action remembered to list every path it could
// possibly affect.
export function revalidateSite() {
  revalidatePath("/", "layout");
}

// Metadata route conventions (sitemap.xml, robots.txt) aren't necessarily
// covered by the "layout" revalidation above, so shoot changes — which
// affect the sitemap's URL list — revalidate this explicitly too.
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
}
