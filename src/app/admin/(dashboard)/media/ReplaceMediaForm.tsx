"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_MEDIA_TYPES, MAX_FILE_SIZE, MEDIA_BUCKET, buildMediaStoragePath, readImageDimensions } from "@/lib/media";
import { finalizeMediaReplace } from "./actions";

export function ReplaceMediaForm({ mediaId }: { mediaId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setError("Bestandstype wordt niet ondersteund.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Bestand is groter dan 50MB.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const path = buildMediaStoragePath(file.name);

    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
    });

    if (uploadError) {
      setError("Uploaden is mislukt.");
      setIsSubmitting(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    const dimensions = await readImageDimensions(file);

    const result = await finalizeMediaReplace(mediaId, {
      storage_path: path,
      url: publicUrlData.publicUrl,
      mime_type: file.type,
      file_size: file.size,
      width: dimensions?.width,
      height: dimensions?.height,
    });

    setIsSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3 rounded-sm border border-line bg-paper p-4">
      <p className="text-xs font-medium tracking-[0.2em] text-brown uppercase">Foto vervangen</p>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          disabled={isSubmitting}
          onChange={handleFileChange}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-medium file:text-cream disabled:opacity-60"
        />
        {isSubmitting && <Loader2 className="shrink-0 animate-spin text-brown" size={16} />}
      </label>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
