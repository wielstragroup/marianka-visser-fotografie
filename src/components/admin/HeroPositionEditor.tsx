"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Move } from "lucide-react";
import { MediaImage } from "@/components/ui/MediaImage";
import { cn } from "@/lib/utils";
import { updateMediaPosition } from "@/app/admin/(dashboard)/media/actions";
import type { Media } from "@/lib/types/database.types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Simple, reliable "position + zoom" editor: no real cropping/export, just a
// focal point (%) + zoom factor stored on the media row and rendered via CSS
// (object-position + transform: scale, see MediaImage.tsx). The two preview
// frames use the exact same MediaImage component the public site renders,
// so what the admin sees here is what actually ships.
export function HeroPositionEditor({ media }: { media: Media }) {
  const router = useRouter();
  const [focalX, setFocalX] = useState(media.focal_x ?? 50);
  const [focalY, setFocalY] = useState(media.focal_y ?? 50);
  const [zoom, setZoom] = useState(media.zoom ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const dragState = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(null);

  const previewMedia = { ...media, focal_x: focalX, focal_y: focalY, zoom };
  const hasChanges = focalX !== (media.focal_x ?? 50) || focalY !== (media.focal_y ?? 50) || zoom !== (media.zoom ?? 1);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { x: e.clientX, y: e.clientY, focalX, focalY };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    const dxPercent = ((e.clientX - dragState.current.x) / box.width) * 100;
    const dyPercent = ((e.clientY - dragState.current.y) / box.height) * 100;
    setFocalX(clamp(dragState.current.focalX - dxPercent, 0, 100));
    setFocalY(clamp(dragState.current.focalY - dyPercent, 0, 100));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleReset() {
    setFocalX(50);
    setFocalY(50);
    setZoom(1);
    setMessage(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    const result = await updateMediaPosition(media.id, { focal_x: focalX, focal_y: focalY, zoom });
    setIsSaving(false);

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }

    setMessage({ type: "success", text: "Positie opgeslagen." });
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-sm border border-line bg-paper p-5">
      <p className="text-xs font-medium tracking-[0.2em] text-brown uppercase">
        Positie &amp; zoom (voor gebruik als hero-afbeelding)
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Sleep de foto om te verschuiven en gebruik de schuifregelaar om in of uit te zoomen. De
        kaders hieronder tonen hoe de foto er ongeveer uitziet op desktop en op mobiel.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-[2fr_1fr]">
        <div>
          <p className="mb-2 text-xs font-medium text-ink-soft">Desktop</p>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative aspect-[21/9] w-full cursor-grab touch-none overflow-hidden rounded-sm bg-blush-soft active:cursor-grabbing"
          >
            <MediaImage media={previewMedia} fill sizes="600px" className="pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-cream/70">
              <Move size={20} />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-soft">Mobiel</p>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-blush-soft">
            <MediaImage media={previewMedia} fill sizes="200px" className="absolute inset-0" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:max-w-xs">
        <label htmlFor="zoom" className="text-xs font-medium text-ink-soft">
          Zoom
        </label>
        <input
          id="zoom"
          type="range"
          min={1}
          max={2.5}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="accent-brown"
        />
      </div>

      {message && (
        <p
          className={cn(
            "mt-4 flex items-center gap-2 text-sm",
            message.type === "error" ? "text-red-700" : "text-green-800"
          )}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {message.text}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brown-dark disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Opslaan...
            </>
          ) : (
            "Positie opslaan"
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
        >
          Standaard positie
        </button>
      </div>
    </div>
  );
}
