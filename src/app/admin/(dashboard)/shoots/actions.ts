"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { shootSchema } from "@/lib/validations/admin";
import { revalidateSite, revalidateSitemap } from "@/lib/revalidate";

export async function createShoot(formData: FormData) {
  await requireAdmin();
  const parsed = shootSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/shoots/new?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shoots").insert(parsed.data);

  if (error) {
    const message = error.code === "23505" ? "Er bestaat al een shoot met deze slug." : "Opslaan is mislukt.";
    redirect(`/admin/shoots/new?notice=${encodeURIComponent(message)}&type=error`);
  }

  revalidateSite();
  revalidateSitemap();
  redirect("/admin/shoots?notice=" + encodeURIComponent("Shoot toegevoegd."));
}

export async function updateShoot(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = shootSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/shoots/${id}?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shoots").update(parsed.data).eq("id", id);

  if (error) {
    const message = error.code === "23505" ? "Er bestaat al een shoot met deze slug." : "Opslaan is mislukt.";
    redirect(`/admin/shoots/${id}?notice=${encodeURIComponent(message)}&type=error`);
  }

  // Full-site revalidation (not just the new slug) matters here: if the
  // slug was changed, the OLD /shoots/[oldSlug] page would otherwise stay
  // statically cached and keep serving stale content forever.
  revalidateSite();
  revalidateSitemap();
  redirect(`/admin/shoots/${id}?notice=${encodeURIComponent("Wijzigingen opgeslagen.")}`);
}

export async function deleteShoot(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shoots").delete().eq("id", id);
  revalidateSite();
  revalidateSitemap();
  redirect("/admin/shoots?notice=" + encodeURIComponent("Shoot verwijderd."));
}
