"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAllAvailability } from "@/lib/data/admin";

export async function updateAvailability(formData: FormData) {
  await requireAdmin();
  const rows = await getAllAvailability();
  const supabase = await createClient();

  for (const row of rows) {
    const moment_label = String(formData.get(`moment_label_${row.id}`) || row.moment_label).trim();
    const is_available = formData.get(`is_available_${row.id}`) === "on";

    await supabase
      .from("availability")
      .update({ moment_label, is_available })
      .eq("id", row.id);
  }

  revalidatePath("/contact");
  revalidatePath("/faq");
  redirect("/admin/availability?notice=" + encodeURIComponent("Beschikbaarheid opgeslagen."));
}
