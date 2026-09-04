"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { testimonialSchema } from "@/lib/validations/admin";

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/testimonials/new?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert(parsed.data);

  if (error) {
    redirect(`/admin/testimonials/new?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidatePath("/");
  redirect("/admin/testimonials?notice=" + encodeURIComponent("Recensie toegevoegd."));
}

export async function updateTestimonial(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/testimonials/${id}?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update(parsed.data).eq("id", id);

  if (error) {
    redirect(`/admin/testimonials/${id}?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidatePath("/");
  redirect(`/admin/testimonials/${id}?notice=${encodeURIComponent("Wijzigingen opgeslagen.")}`);
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/");
  redirect("/admin/testimonials?notice=" + encodeURIComponent("Recensie verwijderd."));
}

export async function setTestimonialsEnabled(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("testimonials_enabled") === "on";

  const supabase = await createClient();
  await supabase.from("site_settings").update({ testimonials_enabled: enabled }).eq("id", true);

  revalidatePath("/");
  redirect(
    "/admin/testimonials?notice=" +
      encodeURIComponent(enabled ? "Recensiesectie ingeschakeld." : "Recensiesectie uitgeschakeld.")
  );
}
