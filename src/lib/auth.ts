import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Re-verifies admin status server-side. Proxy (src/proxy.ts) only checks "is
// there a logged-in user" for routing convenience — this is the actual
// authorization check and must be called at the top of every admin page,
// layout, Server Action, and Route Handler that touches privileged data.
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }

  return { user, profile };
}
