import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

// Anon, cookie-less client for read-only public-site queries. These never
// need a user session — every row they touch is already scoped by RLS
// (is_visible = true) to anonymous-readable data — so unlike
// lib/supabase/server.ts this doesn't call cookies(), which means it can
// safely run in build-time contexts like generateStaticParams as well as in
// Server Components and Route Handlers.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
