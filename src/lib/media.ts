// Shared between the browser upload flow and any server-side code that
// needs to derive the same storage path shape. No server-only APIs here.

export const MEDIA_BUCKET = "media";
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — generous for high-res source photography
export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

export function sanitizeFilename(name: string) {
  const dot = name.lastIndexOf(".");
  const base =
    (dot > 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "foto";
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  return `${base}${ext}`;
}

export function buildMediaStoragePath(filename: string) {
  return `uploads/${crypto.randomUUID()}-${sanitizeFilename(filename)}`;
}

// Browser-only: reads a file's natural pixel dimensions before upload, so
// the DB can store the real aspect ratio (used by the masonry portfolio to
// avoid a forced crop). Resolves to null rather than throwing if the format
// can't be decoded client-side (e.g. HEIC in most non-Safari browsers) —
// callers just omit width/height in that case, same as today's behavior.
export function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
