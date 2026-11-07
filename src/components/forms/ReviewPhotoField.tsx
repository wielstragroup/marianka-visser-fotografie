"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { prepareReviewPhoto } from "@/lib/image-optimize";
import { REVIEW_PHOTO_MAX_BYTES, REVIEW_PHOTO_TYPES } from "@/lib/validations/testimonial";

const buttonClasses =
  "cursor-pointer rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brown";

// Picks a photo, shows a preview and hands the resized version to the parent.
// The preview is a local object URL: nothing leaves the browser until the
// parent form is submitted.
export function ReviewPhotoField({
  onChange,
  onPreparingChange,
  error,
  label = "Foto",
  optional = true,
}: {
  onChange: (photo: Blob | null) => void;
  onPreparingChange?: (isPreparing: boolean) => void;
  error?: string;
  label?: string;
  optional?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clear(message: string | null = null) {
    setPreviewUrl(null);
    setLocalError(message);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!REVIEW_PHOTO_TYPES.includes(file.type)) {
      clear("Dit bestandstype kan niet. Kies een JPG, PNG of WebP.");
      return;
    }
    if (file.size > REVIEW_PHOTO_MAX_BYTES) {
      clear("Deze foto is te groot. De maximale grootte is 5 MB.");
      return;
    }

    setIsPreparing(true);
    onPreparingChange?.(true);
    const prepared = await prepareReviewPhoto(file).catch(() => null);
    setIsPreparing(false);
    onPreparingChange?.(false);

    if (!prepared) {
      clear("Deze foto kan niet worden gelezen. Probeer een andere foto.");
      return;
    }

    setLocalError(null);
    setPreviewUrl(URL.createObjectURL(prepared));
    onChange(prepared);
  }

  const shownError = localError ?? error;

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-soft">(optioneel)</span>}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob: URL, next/image can't load it
          <img src={previewUrl} alt="Voorbeeld van je foto" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-line bg-paper text-brown">
            {isPreparing ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} strokeWidth={1.5} />}
          </span>
        )}

        <div className="flex flex-wrap gap-2">
          <label className={`${buttonClasses} has-focus-visible:ring-2 has-focus-visible:ring-brown`}>
            {previewUrl ? "Andere foto kiezen" : "Foto kiezen"}
            <input
              ref={inputRef}
              type="file"
              accept={REVIEW_PHOTO_TYPES.join(",")}
              onChange={handleSelect}
              className="sr-only"
            />
          </label>
          {previewUrl && (
            <button type="button" onClick={() => clear()} className={buttonClasses}>
              Verwijderen
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-ink-soft">JPG, PNG of WebP, maximaal 5 MB.</p>
      {shownError && (
        <p className="mt-1.5 text-sm text-red-700" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}
