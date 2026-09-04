"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Media } from "@/lib/types/database.types";

// Generic fullscreen photo viewer: original aspect ratio (object-contain,
// never re-cropped), keyboard + click-outside + swipe to close/navigate.
export function Lightbox({
  media,
  index,
  onClose,
  onIndexChange,
}: {
  media: Media[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || index === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index! - 1 + media.length) % media.length);
      if (e.key === "ArrowRight") onIndexChange((index! + 1) % media.length);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, index, media.length, onClose, onIndexChange]);

  if (index === null) return null;

  const item = media[index];
  const goPrev = () => onIndexChange((index - 1 + media.length) % media.length);
  const goNext = () => onIndexChange((index + 1) % media.length);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto vergroot"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Sluiten"
        className="absolute right-4 top-4 rounded-full p-2 text-cream/90 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream sm:right-6 sm:top-6"
      >
        <X size={28} />
      </button>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Vorige foto"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream/90 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream sm:left-4"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Volgende foto"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream/90 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream sm:right-4"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative h-[90vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={item.url}
          alt={item.alt_text || item.title || ""}
          fill
          quality={90}
          sizes="(min-width: 768px) 90vw, 96vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
