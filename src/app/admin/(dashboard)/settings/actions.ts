"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validations/admin";

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/settings?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", true);

  if (error) {
    redirect(`/admin/settings?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidatePath("/", "layout");
  redirect("/admin/settings?notice=" + encodeURIComponent("Instellingen opgeslagen."));
}
