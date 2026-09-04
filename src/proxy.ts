import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and gate-keeps
// /admin at the edge. This is a UX convenience only — every admin
// Server Action and data query still re-checks admin status server-side
// (see lib/auth.ts), since proxy alone must never be the only guard. This
// matters in particular because Server Actions are dispatched as POST
// requests to the page they're called from, so they run through this same
// matcher — but authorization must never rely on that.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  // Scoped to /admin only: the public site's data layer uses an anon,
  // cookie-less Supabase client (lib/supabase/public.ts) and never reads the
  // auth session, so running this on every route would cost an auth
  // round-trip on every public page view (and the contact API call) for no
  // benefit — only /admin actually depends on the session.
  matcher: ["/admin/:path*"],
};
