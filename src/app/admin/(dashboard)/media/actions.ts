"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mediaMetaSchema, mediaPositionSchema } from "@/lib/validations/admin";
import { ALLOWED_MEDIA_TYPES, MAX_FILE_SIZE, MEDIA_BUCKET } from "@/lib/media";

// Uploading is done client-side, straight from the browser to Supabase
// Storage (see UploadForm.tsx / ReplaceMediaForm.tsx) — the file bytes never
// pass through a Next.js server function. That matters in production: a
// Server Action's request body is capped (Vercel's own platform limit for
// serverless functions is well under what a single high-res photo needs,
// regardless of Next.js's own `bodySizeLimit` config), so routing real photo
// uploads through one would silently fail for exactly the "hoogwaardige
// fotografie" this library exists to hold. These actions only ever handle
// small JSON-shaped metadata after the browser upload has already
// succeeded — authorization and shape validation still happen here, since
// the client is never trusted.

const newMediaSchema = z.object({
  storage_path: z.string().trim().min(1).startsWith("uploads/"),
  url: z.string().trim().url(),
  mime_type: z.string().refine((v) => (ALLOWED_MEDIA_TYPES as string[]).includes(v)),
  file_size: z.number().positive().max(MAX_FILE_SIZE),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  title: z.string().trim().max(200),
});

const replaceMediaSchema = newMediaSchema.omit({ title: true });

function revalidateMediaPaths() {
  revalidatePath("/", "layout");
}

export async function createMediaRecord(
  input: z.infer<typeof newMediaSchema>
): Promise<{ error: string } | { success: true }> {
  await requireAdmin();
  const parsed = newMediaSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Ongeldige foto-gegevens." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("media").insert({
    storage_path: parsed.data.storage_path,
    url: parsed.data.url,
    mime_type: parsed.data.mime_type,
    file_size: parsed.data.file_size,
    width: parsed.data.width ?? null,
    height: parsed.data.height ?? null,
    title: parsed.data.title,
    alt_text: "",
    is_visible: true,
    is_featured: false,
    sort_order: 0,
  });

  if (error) {
    // Best-effort cleanup so a failed DB insert doesn't leave an orphaned
    // file sitting in Storage forever.
    await supabase.storage.from(MEDIA_BUCKET).remove([parsed.data.storage_path]);
    return { error: "Opslaan is mislukt." };
  }

  revalidateMediaPaths();
  return { success: true as const };
}

export async function updateMediaMeta(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = mediaMetaSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/media/${id}?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("media").update(parsed.data).eq("id", id);

  if (error) {
    redirect(`/admin/media/${id}?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateMediaPaths();
  redirect(`/admin/media/${id}?notice=${encodeURIComponent("Wijzigingen opgeslagen.")}`);
}

export async function finalizeMediaReplace(
  id: string,
  input: z.infer<typeof replaceMediaSchema>
): Promise<{ error: string } | { success: true }> {
  await requireAdmin();
  const parsed = replaceMediaSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Ongeldige foto-gegevens." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("media").select("storage_path").eq("id", id).single();

  if (!existing) {
    return { error: "Foto niet gevonden." };
  }

  const { error } = await supabase
    .from("media")
    .update({
      storage_path: parsed.data.storage_path,
      url: parsed.data.url,
      mime_type: parsed.data.mime_type,
      file_size: parsed.data.file_size,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
    })
    .eq("id", id);

  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([parsed.data.storage_path]);
    return { error: "Opslaan is mislukt." };
  }

  await supabase.storage.from(MEDIA_BUCKET).remove([existing.storage_path]);

  revalidateMediaPaths();
  return { success: true as const };
}

export async function updateMediaPosition(
  id: string,
  input: z.infer<typeof mediaPositionSchema>
): Promise<{ error: string } | { success: true }> {
  await requireAdmin();
  const parsed = mediaPositionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Ongeldige positiegegevens." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("media").update(parsed.data).eq("id", id);

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  revalidateMediaPaths();
  return { success: true as const };
}

export async function deleteMedia(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("media").select("storage_path").eq("id", id).single();
  await supabase.from("media").delete().eq("id", id);

  if (existing) {
    await supabase.storage.from(MEDIA_BUCKET).remove([existing.storage_path]);
  }

  revalidateMediaPaths();
  redirect("/admin/media?notice=" + encodeURIComponent("Foto verwijderd."));
}
