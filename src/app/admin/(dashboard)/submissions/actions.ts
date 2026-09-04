"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_OPTIONS } from "@/lib/constants/submissions";
import type { SubmissionStatus } from "@/lib/types/database.types";

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (STATUS_OPTIONS as string[]).includes(value);
}

export async function updateSubmissionStatus(id: string, formData: FormData) {
  await requireAdmin();
  const rawStatus = String(formData.get("status") || "");

  if (!isSubmissionStatus(rawStatus)) {
    redirect(`/admin/submissions/${id}?notice=${encodeURIComponent("Ongeldige status.")}&type=error`);
  }

  const status = rawStatus;

  const supabase = await createClient();
  await supabase.from("contact_submissions").update({ status }).eq("id", id);

  redirect(`/admin/submissions/${id}?notice=${encodeURIComponent("Status bijgewerkt.")}`);
}

export async function deleteSubmission(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("contact_submissions").delete().eq("id", id);
  redirect("/admin/submissions?notice=" + encodeURIComponent("Aanvraag verwijderd."));
}
