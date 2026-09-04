"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { pricingPackageSchema } from "@/lib/validations/admin";
import { revalidateSite } from "@/lib/revalidate";

export async function createPricingPackage(formData: FormData) {
  await requireAdmin();
  const parsed = pricingPackageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/pricing/new?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pricing_packages").insert(parsed.data);

  if (error) {
    redirect(`/admin/pricing/new?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateSite();
  redirect("/admin/pricing?notice=" + encodeURIComponent("Tarief toegevoegd."));
}

export async function updatePricingPackage(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = pricingPackageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/pricing/${id}?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pricing_packages").update(parsed.data).eq("id", id);

  if (error) {
    redirect(`/admin/pricing/${id}?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateSite();
  redirect(`/admin/pricing/${id}?notice=${encodeURIComponent("Wijzigingen opgeslagen.")}`);
}

export async function deletePricingPackage(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("pricing_packages").delete().eq("id", id);
  revalidateSite();
  redirect("/admin/pricing?notice=" + encodeURIComponent("Tarief verwijderd."));
}
