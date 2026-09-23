// Browser-only: shrinks a photo to a web-appropriate WebP before it's
// uploaded to Supabase Storage. This is what keeps Supabase egress in check
// — a 15MB DSLR original never leaves the browser; only a ~0.3-1MB WebP
// does. No server-only APIs here (mirrors readImageDimensions in media.ts).

const MAX_LONG_EDGE = 2400;
const WEBP_QUALITY_START = 0.85;
const WEBP_QUALITY_MIN = 0.7;
const SOFT_MAX_BYTES = 2 * 1024 * 1024; // step quality down toward the floor above this

export type OptimizedImage = {
  blob: Blob;
  width: number;
  height: number;
  contentType: "image/webp";
  filename: string;
};

// Returns null when the file can't (or shouldn't) be optimized client-side —
// HEIC/HEIF has no reliable canvas decode support outside Safari, and any
// unexpected decode/encode failure falls back to the original file rather
// than blocking the upload. Also returns null if optimizing didn't actually
// help (e.g. an already-small image), so callers never end up uploading a
// larger file than the original.
export async function optimizeImageForUpload(file: File): Promise<OptimizedImage | null> {
  if (file.type === "image/heic" || file.type === "image/heif") return null;
  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") return null;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }

  try {
    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = WEBP_QUALITY_START;
    let blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > SOFT_MAX_BYTES && quality > WEBP_QUALITY_MIN) {
      quality -= 0.05;
      blob = await canvasToBlob(canvas, quality);
    }

    if (!blob || blob.size >= file.size) return null;

    return {
      blob,
      width,
      height,
      contentType: "image/webp",
      filename: file.name.replace(/\.[^.]+$/, "") + ".webp",
    };
  } catch {
    return null;
  } finally {
    bitmap.close();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}
