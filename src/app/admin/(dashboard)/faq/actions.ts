"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { faqSchema } from "@/lib/validations/admin";

function revalidateFaqPaths() {
  revalidatePath("/");
  revalidatePath("/faq");
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/faq/new?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert(parsed.data);

  if (error) {
    redirect(`/admin/faq/new?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateFaqPaths();
  redirect("/admin/faq?notice=" + encodeURIComponent("Vraag toegevoegd."));
}

export async function updateFaq(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/faq/${id}?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update(parsed.data).eq("id", id);

  if (error) {
    redirect(`/admin/faq/${id}?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateFaqPaths();
  redirect(`/admin/faq/${id}?notice=${encodeURIComponent("Wijzigingen opgeslagen.")}`);
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("faqs").delete().eq("id", id);
  revalidateFaqPaths();
  redirect("/admin/faq?notice=" + encodeURIComponent("Vraag verwijderd."));
}
