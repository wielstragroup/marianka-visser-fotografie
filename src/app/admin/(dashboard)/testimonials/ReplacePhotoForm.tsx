"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ReviewPhotoField } from "@/components/forms/ReviewPhotoField";

export function ReplacePhotoForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) return;

    const formData = new FormData(event.currentTarget);
    formData.set("photo", photo, "foto.jpg");
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ReviewPhotoField onChange={setPhoto} label="Nieuwe foto" optional={false} />

      {photo && (
        <>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" name="photo_consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brown" />
            De klant heeft toestemming gegeven om deze foto te publiceren
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brown-dark disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Opslaan...
              </>
            ) : (
              "Foto opslaan"
            )}
          </button>
        </>
      )}
    </form>
  );
}
