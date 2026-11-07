import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET, TESTIMONIAL_MEDIA_PREFIX } from "@/lib/media";
import { REVIEW_PHOTO_BUCKET, REVIEW_PHOTO_MAX_BYTES } from "@/lib/validations/testimonial";

// Lifecycle of a customer photo. The original stays in a private bucket for as
// long as the review exists (testimonials.photo_path). While a review is
// approved, a copy sits in the public media bucket, linked through
// avatar_media_id. Everything here uses the service-role client, so callers
// must have validated the upload or passed requireAdmin() first.

const SIGNED_URL_SECONDS = 60 * 10;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ReviewPhoto = { bytes: Uint8Array; contentType: string };

// Either a link, or the reason there is none. A failed link must never read as
// "this review has no photo".
export type SignedPhoto = { url: string; error?: never } | { url?: never; error: string };

const SIGNED_URL_ERROR = "De foto kon niet worden geladen.";

// Files without a reference are only treated as left over once they're older
// than this. A reference is only ever attached to a file that the same request
// created moments earlier, so this protects uploads that are still in flight;
// no request runs anywhere near this long.
const ORPHAN_GRACE_MS = 15 * 60 * 1000;
const LIST_PAGE_SIZE = 1000;

// The private original is gone, so there is nothing to publish from.
export class PhotoMissingError extends Error {}

function isNotFound(error: unknown) {
  const { status, message } = error as { status?: number; message?: string };
  return status === 400 || status === 404 || /not.?found/i.test(message ?? "");
}

// Identifies a file by its actual leading bytes: the name and the MIME type
// are both chosen by the client.
function detectImageType(bytes: Uint8Array) {
  const startsWith = (signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

export async function readReviewPhoto(file: File): Promise<ReviewPhoto | { error: string }> {
  if (file.size > REVIEW_PHOTO_MAX_BYTES) {
    return { error: "Je foto is te groot. De maximale grootte is 5 MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectImageType(bytes);

  if (!contentType) {
    return { error: "Dit bestand is geen geldige foto. Kies een JPG, PNG of WebP." };
  }

  return { bytes, contentType };
}

export async function storePrivatePhoto({ bytes, contentType }: ReviewPhoto) {
  const path = `${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
  const { error } = await createAdminClient()
    .storage.from(REVIEW_PHOTO_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });

  if (error) throw error;
  return path;
}

export async function removePrivatePhoto(path: string | null) {
  if (!path) return;
  const { error } = await createAdminClient().storage.from(REVIEW_PHOTO_BUCKET).remove([path]);
  if (error) throw error;
}

// Copies the private photo into the public media bucket. Returns the new media
// id, or null when there's nothing that may be published.
export async function publishPhoto(review: { photo_path: string | null; photo_consent: boolean }) {
  if (!review.photo_path || !review.photo_consent) return null;

  const supabase = createAdminClient();
  const { data: file, error: downloadError } = await supabase.storage
    .from(REVIEW_PHOTO_BUCKET)
    .download(review.photo_path);
  if (downloadError) {
    throw isNotFound(downloadError) ? new PhotoMissingError(review.photo_path) : downloadError;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectImageType(bytes);
  if (!contentType) throw new Error("Stored review photo is not a valid image");

  const storagePath = `${TESTIMONIAL_MEDIA_PREFIX}${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, bytes, { contentType, upsert: false });
  if (uploadError) throw uploadError;

  const { data: media, error: insertError } = await supabase
    .from("media")
    .insert({
      storage_path: storagePath,
      url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl,
      mime_type: contentType,
      file_size: bytes.byteLength,
      alt_text: "",
      category: "recensie",
    })
    .select("id")
    .single();

  if (insertError) {
    const { error: cleanupError } = await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    if (cleanupError) {
      console.error("[testimonials] Openbare kopie blijft achter na mislukte insert:", storagePath, cleanupError);
    }
    throw insertError;
  }

  return media.id;
}

// Removes a published copy. A photo Marianka picked from her own library stays
// untouched: only files under the testimonials/ prefix belong to a review.
//
// Storage and Postgres share no transaction, so the file goes first and the
// media row last: as long as anything is left, the row still points at it.
// That also makes this safe to repeat. Removing a file that's already gone
// succeeds, and a missing row means an earlier call finished. The foreign key
// clears avatar_media_id on the review once the row is deleted.
export async function unpublishPhoto(mediaId: string | null) {
  if (!mediaId) return;

  const supabase = createAdminClient();
  const { data: media, error: readError } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (readError) throw readError;
  if (!media || !media.storage_path.startsWith(TESTIMONIAL_MEDIA_PREFIX)) return;

  const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([media.storage_path]);
  if (removeError) throw removeError;

  const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);
  if (deleteError) throw deleteError;
}

// Whether a media id is a review's own public copy (as opposed to a library
// photo, which must never be deleted).
export async function isReviewCopy(mediaId: string) {
  const { data: media, error } = await createAdminClient()
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(media?.storage_path.startsWith(TESTIMONIAL_MEDIA_PREFIX));
}

// Whether a linked public copy still has its file. Library photos are reported
// as such and never checked or touched.
export async function publicCopyState(mediaId: string): Promise<"present" | "missing" | "library"> {
  const supabase = createAdminClient();
  const { data: media, error } = await supabase.from("media").select("storage_path").eq("id", mediaId).maybeSingle();
  if (error) throw error;
  if (!media) return "missing";
  if (!media.storage_path.startsWith(TESTIMONIAL_MEDIA_PREFIX)) return "library";

  // exists() resolves to false for a missing file and throws on any other error.
  const { data: exists } = await supabase.storage.from(MEDIA_BUCKET).exists(media.storage_path);
  return exists ? "present" : "missing";
}

// Public copies and private originals that no review points at, left behind
// when a delete failed after its reference was already released.
export async function findOrphanedPhotos() {
  const supabase = createAdminClient();
  const cutoff = Date.now() - ORPHAN_GRACE_MS;

  const [reviews, copies] = await Promise.all([
    supabase.from("testimonials").select("photo_path, avatar_media_id"),
    supabase.from("media").select("id, storage_path, created_at").like("storage_path", `${TESTIMONIAL_MEDIA_PREFIX}%`),
  ]);
  if (reviews.error) throw reviews.error;
  if (copies.error) throw copies.error;

  const usedCopies = new Set(reviews.data.flatMap((r) => r.avatar_media_id ?? []));
  const usedPaths = new Set(reviews.data.flatMap((r) => r.photo_path ?? []));

  const publicCopies = copies.data
    .filter((m) => !usedCopies.has(m.id) && Date.parse(m.created_at) < cutoff)
    .map((m) => m.id);

  const privateFiles: string[] = [];
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(REVIEW_PHOTO_BUCKET)
      .list("", { limit: LIST_PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;

    for (const object of data) {
      const createdAt = object.created_at ? Date.parse(object.created_at) : Number.NaN;
      if (object.id && !usedPaths.has(object.name) && createdAt < cutoff) privateFiles.push(object.name);
    }
    if (data.length < LIST_PAGE_SIZE) break;
  }

  return { publicCopies, privateFiles };
}

export async function removeOrphanedPhotos({ publicCopies, privateFiles }: { publicCopies: string[]; privateFiles: string[] }) {
  let removed = 0;
  let failed = 0;

  for (const id of publicCopies) {
    try {
      await unpublishPhoto(id);
      removed++;
    } catch (error) {
      console.error("[testimonials] Verweesde openbare kopie niet verwijderd:", id, error);
      failed++;
    }
  }

  if (privateFiles.length > 0) {
    const { error } = await createAdminClient().storage.from(REVIEW_PHOTO_BUCKET).remove(privateFiles);
    if (error) {
      console.error("[testimonials] Verweesde privé-foto's niet verwijderd:", privateFiles, error);
      failed += privateFiles.length;
    } else {
      removed += privateFiles.length;
    }
  }

  return { removed, failed };
}

// Short-lived links so an admin can look at photos that aren't public.
export async function getSignedPhotoUrls(paths: string[]) {
  const photos = new Map<string, SignedPhoto>(paths.map((path) => [path, { error: SIGNED_URL_ERROR }]));
  if (paths.length === 0) return photos;

  try {
    const { data, error } = await createAdminClient()
      .storage.from(REVIEW_PHOTO_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    if (error) throw error;

    for (const item of data) {
      if (item.path && item.signedUrl) {
        photos.set(item.path, { url: item.signedUrl });
      } else {
        console.error("[testimonials] Signed URL mislukt:", item.path, item.error);
      }
    }
  } catch (error) {
    console.error("[testimonials] Signed URLs maken is mislukt:", error);
  }

  return photos;
}
