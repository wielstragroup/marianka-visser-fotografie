"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_MEDIA_TYPES, MAX_FILE_SIZE, MEDIA_BUCKET, buildMediaStoragePath, readImageDimensions } from "@/lib/media";
import { createMediaRecord } from "./actions";

type FileStatus = "pending" | "uploading" | "done" | "error";
type UploadItem = { file: File; status: FileStatus; message?: string };

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleUpload() {
    if (files.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    const supabase = createClient();

    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];

      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error", message: "Bestandstype niet ondersteund" } : f)));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error", message: "Bestand te groot (max 50MB)" } : f)));
        continue;
      }

      setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f)));

      const path = buildMediaStoragePath(file.name);
      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error", message: "Uploaden mislukt" } : f)));
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const dimensions = await readImageDimensions(file);

      const result = await createMediaRecord({
        storage_path: path,
        url: publicUrlData.publicUrl,
        mime_type: file.type,
        file_size: file.size,
        width: dimensions?.width,
        height: dimensions?.height,
        title: file.name.replace(/\.[^.]+$/, ""),
      });

      if ("error" in result) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error", message: result.error } : f)));
        continue;
      }

      setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f)));
    }

    setIsSubmitting(false);
    // Drop the successfully uploaded files so re-clicking "Uploaden" can't
    // re-upload (and duplicate) them — only failed ones stay, ready to retry.
    setFiles((prev) => prev.filter((f) => f.status === "error"));
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-dashed border-line bg-blush-soft/30 p-6">
      <label htmlFor="files" className="flex cursor-pointer flex-col items-center gap-2 text-center">
        <Upload className="text-brown" size={24} />
        <span className="text-sm font-medium text-ink">
          {files.length > 0 ? `${files.length} bestand(en) geselecteerd` : "Klik om foto's te selecteren"}
        </span>
        <span className="text-xs text-ink-soft">JPG, PNG, WebP of AVIF — meerdere foto&apos;s tegelijk mogelijk</span>
      </label>
      <input
        ref={inputRef}
        id="files"
        name="files"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) =>
          setFiles(Array.from(e.target.files ?? []).map((file) => ({ file, status: "pending" as FileStatus })))
        }
      />

      {files.length > 0 && (
        <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-xs">
          {files.map(({ file, status, message }, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-ink-soft">
              <span className="truncate">{file.name}</span>
              <span
                className={
                  status === "error" ? "text-red-700" : status === "done" ? "text-green-700" : "text-ink-soft"
                }
              >
                {status === "pending" && "Wacht..."}
                {status === "uploading" && "Uploaden..."}
                {status === "done" && "Klaar"}
                {status === "error" && (message ?? "Mislukt")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brown-dark disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Uploaden...
              </>
            ) : (
              "Uploaden"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
