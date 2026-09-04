"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { homePageSchema, overMijPageSchema } from "@/lib/validations/admin";

export async function updateHomePage(formData: FormData) {
  await requireAdmin();
  const parsed = homePageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/pages/home?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { intro_text, about_teaser_text, shoots_quote, seo_title, seo_description } = parsed.data;

  const { error } = await supabase
    .from("pages")
    .update({ content: { intro_text, about_teaser_text, shoots_quote }, seo_title, seo_description })
    .eq("slug", "home");

  if (error) {
    redirect(`/admin/pages/home?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidatePath("/");
  redirect("/admin/pages/home?notice=" + encodeURIComponent("Wijzigingen opgeslagen."));
}

export async function updateOverMijPage(formData: FormData) {
  await requireAdmin();
  const parsed = overMijPageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/pages/over-mij?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { paragraphs, seo_title, seo_description } = parsed.data;

  const { error } = await supabase
    .from("pages")
    .update({ content: { paragraphs }, seo_title, seo_description })
    .eq("slug", "over-mij");

  if (error) {
    redirect(`/admin/pages/over-mij?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidatePath("/over-mij");
  redirect("/admin/pages/over-mij?notice=" + encodeURIComponent("Wijzigingen opgeslagen."));
}
