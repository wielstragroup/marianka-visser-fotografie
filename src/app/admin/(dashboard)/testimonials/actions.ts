"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidateSite } from "@/lib/revalidate";
import { testimonialSchema } from "@/lib/validations/admin";
import { TESTIMONIAL_STATUS_OPTIONS } from "@/lib/constants/testimonials";
import {
  findOrphanedPhotos,
  isReviewCopy,
  PhotoMissingError,
  publicCopyState,
  publishPhoto,
  readReviewPhoto,
  removeOrphanedPhotos,
  removePrivatePhoto,
  storePrivatePhoto,
  unpublishPhoto,
} from "@/lib/testimonial-photos";
import type { TestimonialStatus } from "@/lib/types/database.types";

// How the photo actions stay correct when two admin actions hit the same
// review at once (two tabs, two devices):
//
// 1. Every update and delete is a compare-and-swap. It only matches while
//    status, photo_path and avatar_media_id still hold the values this action
//    read, and .select("id") tells whether it did. Postgres re-checks those
//    conditions while applying a single UPDATE/DELETE, so of two racing
//    actions exactly one wins. The loser reports that the review changed and
//    never claims success.
// 2. Files are only deleted after the row has atomically let go of them. An
//    action never deletes a file that another action may still be relying on.
// 3. A losing action only rolls back files it created itself.
// 4. Storage and Postgres share no transaction, so a delete can still fail
//    after the reference is gone. The file then stays findable (its media row,
//    or the private bucket listing), and cleanUpOrphanedPhotos removes it.

const NO_CONSENT_MESSAGE = "Zonder toestemming van de klant kan deze recensie niet gepubliceerd worden.";
const READ_FAILED_MESSAGE = "De recensie kon niet worden opgehaald. Probeer het opnieuw.";
const STALE_MESSAGE =
  "Deze recensie is intussen door een andere actie gewijzigd. Deze actie is niet uitgevoerd; bekijk de recensie opnieuw.";
const PHOTO_FAILED_MESSAGE = "Er ging iets mis met de foto. Probeer het opnieuw.";
const PHOTO_MISSING_MESSAGE =
  "De foto van deze recensie ontbreekt in de opslag. Verwijder de foto (de recensie blijft staan) en keur daarna opnieuw goed.";
const PHOTO_ROLLBACK_MESSAGE =
  "De actie is niet uitgevoerd en een nieuw fotobestand kon niet worden opgeruimd. Gebruik later ‘Opruimen’ bovenaan de pagina.";
const LEFTOVER_MESSAGE =
  "Gelukt, maar niet alle oude fotobestanden konden worden verwijderd. Ze staan nergens meer op de site; gebruik later ‘Opruimen’ bovenaan de pagina.";

const CHECK_VIOLATION = "23514";

const REVIEW_COLUMNS = "status, photo_path, photo_consent, publication_consent, avatar_media_id";

const STATUS_NOTICES: Record<TestimonialStatus, string> = {
  pending: "De recensie staat weer bij Nieuw.",
  approved: "De recensie is gepubliceerd.",
  rejected: "De recensie staat niet (meer) op de website.",
};

type Db = Awaited<ReturnType<typeof createClient>>;

const goneUrl = (notice: string) => `/admin/testimonials?notice=${encodeURIComponent(notice)}&type=error`;
type Snapshot = { status: TestimonialStatus; photo_path: string | null; avatar_media_id: string | null };
type PhotoFiles = { photo_path: string | null; avatar_media_id: string | null };

function listUrl(tab: TestimonialStatus, notice: string, type?: "error") {
  return `/admin/testimonials?status=${tab}&notice=${encodeURIComponent(notice)}${type ? `&type=${type}` : ""}`;
}

function editUrl(id: string, notice: string, type?: "error") {
  return `/admin/testimonials/${id}?notice=${encodeURIComponent(notice)}${type ? `&type=${type}` : ""}`;
}

// For failures on the edit page. When the review no longer exists (another
// action deleted it), its edit page would 404 and the message would never be
// seen, so it goes to the overview instead.
async function editFailure(supabase: Db, id: string, notice: string) {
  const { data } = await supabase.from("testimonials").select("id").eq("id", id).maybeSingle();
  return data ? editUrl(id, notice, "error") : `/admin/testimonials?notice=${encodeURIComponent(notice)}&type=error`;
}

function isStatus(value: string): value is TestimonialStatus {
  return (TESTIMONIAL_STATUS_OPTIONS as string[]).includes(value);
}

function snapshotOf(review: Snapshot): Snapshot {
  return { status: review.status, photo_path: review.photo_path, avatar_media_id: review.avatar_media_id };
}

// Narrows an update/delete to the row as this action last saw it.
function unchanged<Q extends { filter(column: string, operator: "eq" | "is", value: unknown): Q }>(
  query: Q,
  expected: Partial<Snapshot>
) {
  let narrowed = query;
  for (const [column, value] of Object.entries(expected)) {
    narrowed = value === null ? narrowed.filter(column, "is", null) : narrowed.filter(column, "eq", value);
  }
  return narrowed;
}

async function loadReview(supabase: Db, id: string, fail: (notice: string) => string, gone = fail) {
  const { data, error } = await supabase.from("testimonials").select(REVIEW_COLUMNS).eq("id", id).maybeSingle();

  if (error) {
    console.error("[testimonials] Recensie ophalen is mislukt:", id, error);
    redirect(fail(READ_FAILED_MESSAGE));
  }
  if (!data) {
    redirect(gone("Deze recensie bestaat niet meer."));
  }
  return data;
}

// Deletes files that no row points at any more (or that this action created
// itself). Tries every file, so one failure doesn't leave the rest behind, and
// logs what's left for cleanUpOrphanedPhotos.
async function cleanUpPhotoFiles(files: PhotoFiles) {
  let ok = true;

  try {
    await unpublishPhoto(files.avatar_media_id);
  } catch (error) {
    console.error("[testimonials] Openbare kopie niet verwijderd:", files, error);
    ok = false;
  }

  try {
    await removePrivatePhoto(files.photo_path);
  } catch (error) {
    console.error("[testimonials] Privé-foto niet verwijderd:", files, error);
    ok = false;
  }

  return ok;
}

// Rolls back files this action created, and picks the message for a refused
// write: a failed rollback always wins, because it means a file was left behind.
async function rollBack(files: PhotoFiles, error: { code?: string } | null) {
  const rolledBack = await cleanUpPhotoFiles(files);
  if (!rolledBack) {
    console.error("[testimonials] Terugdraaien is mislukt, bestanden blijven achter:", files);
    return PHOTO_ROLLBACK_MESSAGE;
  }
  if (!error) return STALE_MESSAGE;
  return error.code === CHECK_VIOLATION ? NO_CONSENT_MESSAGE : "Opslaan is mislukt.";
}

// Lets go of the review's public copy and then deletes it. Library photos stay
// linked. "changed" means another action got to the row first, and the copy is
// then not ours to delete.
async function releasePublicCopy(supabase: Db, id: string, expected: Snapshot) {
  if (!expected.avatar_media_id) return "none" as const;

  try {
    if (!(await isReviewCopy(expected.avatar_media_id))) return "none" as const;
  } catch (error) {
    console.error("[testimonials] Openbare kopie controleren is mislukt:", expected, error);
    return "failed" as const;
  }

  const { data, error } = await unchanged(
    supabase.from("testimonials").update({ avatar_media_id: null }).eq("id", id),
    expected
  ).select("id");

  if (error) {
    console.error("[testimonials] Openbare kopie loskoppelen is mislukt:", expected, error);
    return "failed" as const;
  }
  if (data.length !== 1) return "changed" as const;

  const cleaned = await cleanUpPhotoFiles({ photo_path: null, avatar_media_id: expected.avatar_media_id });
  return cleaned ? ("done" as const) : ("leftover" as const);
}

// Reviews added by hand are published straight away: the admin adding one is
// the approval.
export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/testimonials/new?notice=${encodeURIComponent(parsed.error.issues[0].message)}&type=error`);
  }

  if (!parsed.data.publication_consent) {
    redirect(`/admin/testimonials/new?notice=${encodeURIComponent(NO_CONSENT_MESSAGE)}&type=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .insert({ ...parsed.data, status: "approved", approved_at: new Date().toISOString() });

  if (error) {
    redirect(`/admin/testimonials/new?notice=${encodeURIComponent("Opslaan is mislukt.")}&type=error`);
  }

  revalidateSite();
  redirect(listUrl("approved", "Recensie toegevoegd en gepubliceerd."));
}

export async function updateTestimonial(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));
  const fail = (notice: string) => editUrl(id, notice, "error");

  if (!parsed.success) {
    redirect(fail(parsed.error.issues[0].message));
  }

  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail, goneUrl);

  // With a customer photo, avatar_media_id is managed by publishing and the
  // form doesn't offer it, so the empty value must not overwrite it.
  const { avatar_media_id, ...fields } = parsed.data;
  const { data, error } = await unchanged(
    supabase
      .from("testimonials")
      .update(review.photo_path ? fields : { ...fields, avatar_media_id })
      .eq("id", id),
    { photo_path: review.photo_path, avatar_media_id: review.avatar_media_id }
  ).select("id");

  if (error) {
    redirect(fail(error.code === CHECK_VIOLATION ? NO_CONSENT_MESSAGE : "Opslaan is mislukt."));
  }
  if (data.length !== 1) {
    redirect(await editFailure(supabase, id, STALE_MESSAGE));
  }

  revalidateSite();
  redirect(editUrl(id, "Wijzigingen opgeslagen."));
}

export async function setTestimonialStatus(id: string, status: TestimonialStatus, tab: TestimonialStatus) {
  await requireAdmin();

  if (!isStatus(status) || !isStatus(tab)) {
    redirect(listUrl("pending", "Ongeldige status.", "error"));
  }

  const fail = (notice: string) => listUrl(tab, notice, "error");
  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail);

  if (review.status === status) {
    redirect(listUrl(tab, "Deze recensie had deze status al. Er is niets veranderd."));
  }

  if (status === "approved") {
    await approve(supabase, id, review, tab);
  } else {
    await takeOffline(supabase, id, review, status, tab);
  }
}

async function approve(
  supabase: Db,
  id: string,
  review: Snapshot & { photo_consent: boolean; publication_consent: boolean },
  tab: TestimonialStatus
) {
  const fail = (notice: string) => listUrl(tab, notice, "error");

  // Checked up front so a refused approval never creates a public copy at all.
  if (!review.publication_consent) {
    redirect(fail(NO_CONSENT_MESSAGE));
  }

  let publishedId: string | null = null;
  // A linked copy whose file is gone, replaced below by a fresh one.
  let brokenCopyId: string | null = null;
  let copy: "none" | "present" | "missing" | "library" = "none";

  // No redirect() inside this try: it works by throwing, and the catch would
  // swallow it.
  try {
    copy = review.avatar_media_id ? await publicCopyState(review.avatar_media_id) : "none";

    if ((copy === "none" || copy === "missing") && review.photo_path && review.photo_consent) {
      publishedId = await publishPhoto(review);
      if (copy === "missing") brokenCopyId = review.avatar_media_id;
    }
  } catch (error) {
    if (!(error instanceof PhotoMissingError)) {
      console.error("[testimonials] Publiceren van foto is mislukt:", error);
      redirect(fail(PHOTO_FAILED_MESSAGE));
    }
    // A concurrent replace or delete removes the file as well: only call it
    // missing if the row still points at it.
    const { data: now } = await supabase.from("testimonials").select(REVIEW_COLUMNS).eq("id", id).maybeSingle();
    const moved = !now || now.photo_path !== review.photo_path || now.status !== review.status;
    redirect(fail(moved ? STALE_MESSAGE : PHOTO_MISSING_MESSAGE));
  }

  // A linked copy without a file and without a private original to rebuild it
  // from: publishing now would show a broken image.
  if (copy === "missing" && !publishedId) {
    redirect(fail(PHOTO_MISSING_MESSAGE));
  }

  const { data, error } = await unchanged(
    supabase
      .from("testimonials")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        ...(publishedId ? { avatar_media_id: publishedId } : {}),
      })
      .eq("id", id),
    snapshotOf(review)
  ).select("id");

  if (error || data.length !== 1) {
    redirect(fail(await rollBack({ photo_path: null, avatar_media_id: publishedId }, error)));
  }

  // The broken copy's media row has just lost its only reference.
  const leftover = brokenCopyId ? !(await cleanUpPhotoFiles({ photo_path: null, avatar_media_id: brokenCopyId })) : false;

  revalidateSite();
  redirect(leftover ? listUrl(tab, LEFTOVER_MESSAGE, "error") : listUrl(tab, STATUS_NOTICES.approved));
}

async function takeOffline(
  supabase: Db,
  id: string,
  review: Snapshot,
  status: TestimonialStatus,
  tab: TestimonialStatus
) {
  const fail = (notice: string) => listUrl(tab, notice, "error");

  // The status goes first, so the review leaves the site even if the photo
  // cleanup below fails.
  const { data, error } = await unchanged(
    supabase.from("testimonials").update({ status, approved_at: null }).eq("id", id),
    snapshotOf(review)
  ).select("id");

  if (error) {
    redirect(fail("Opslaan is mislukt."));
  }
  if (data.length !== 1) {
    redirect(fail(STALE_MESSAGE));
  }

  const released = await releasePublicCopy(supabase, id, { ...snapshotOf(review), status });
  revalidateSite();

  if (released === "failed") {
    redirect(fail("De recensie is offline, maar de foto staat nog online. Probeer het opnieuw bij de recensie."));
  }
  if (released === "changed") {
    redirect(fail("De recensie is offline gehaald, maar intussen door een andere actie gewijzigd. Bekijk de recensie opnieuw."));
  }
  if (released === "leftover") {
    redirect(fail(LEFTOVER_MESSAGE));
  }
  redirect(listUrl(tab, STATUS_NOTICES[status]));
}

export async function retryPhotoUnpublish(id: string, tab: TestimonialStatus) {
  await requireAdmin();
  const fail = (notice: string) => listUrl(tab, notice, "error");

  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail);

  // A stale page must not be able to take the photo of a live review offline.
  if (review.status === "approved") {
    redirect(listUrl(tab, "Deze recensie is gepubliceerd, de foto blijft staan."));
  }

  const released = await releasePublicCopy(supabase, id, snapshotOf(review));
  revalidateSite();

  if (released === "failed") redirect(fail("De foto staat nog online. Probeer het opnieuw."));
  if (released === "changed") redirect(fail(STALE_MESSAGE));
  if (released === "leftover") redirect(fail(LEFTOVER_MESSAGE));
  redirect(listUrl(tab, "De foto staat niet meer online."));
}

export async function removeTestimonialPhoto(id: string, redirectTo: TestimonialStatus | "edit") {
  await requireAdmin();
  const back = (notice: string, type?: "error") =>
    redirectTo === "edit" ? editUrl(id, notice, type) : listUrl(redirectTo, notice, type);
  const fail = (notice: string) => back(notice, "error");

  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail, redirectTo === "edit" ? goneUrl : fail);

  const { data, error } = await unchanged(
    supabase.from("testimonials").update({ photo_path: null, photo_consent: false, avatar_media_id: null }).eq("id", id),
    snapshotOf(review)
  ).select("id");

  if (error) {
    redirect(fail("Verwijderen is mislukt."));
  }
  if (data.length !== 1) {
    redirect(redirectTo === "edit" ? await editFailure(supabase, id, STALE_MESSAGE) : fail(STALE_MESSAGE));
  }

  // A library photo is only unlinked: unpublishPhoto leaves it alone.
  const cleaned = await cleanUpPhotoFiles(review);

  revalidateSite();
  redirect(cleaned ? back("De foto is verwijderd.") : fail(LEFTOVER_MESSAGE));
}

export async function replaceTestimonialPhoto(id: string, formData: FormData) {
  await requireAdmin();
  const fail = (notice: string) => editUrl(id, notice, "error");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    redirect(fail("Kies eerst een foto."));
  }
  if (formData.get("photo_consent") !== "on") {
    redirect(fail("Bevestig dat de klant toestemming heeft gegeven voor deze foto."));
  }

  const photo = await readReviewPhoto(file);
  if ("error" in photo) {
    redirect(fail(photo.error));
  }

  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail, goneUrl);

  const created: PhotoFiles = { photo_path: null, avatar_media_id: null };

  try {
    created.photo_path = await storePrivatePhoto(photo);
    if (review.status === "approved") {
      created.avatar_media_id = await publishPhoto({ photo_path: created.photo_path, photo_consent: true });
    }
  } catch (error) {
    console.error("[testimonials] Vervangen van foto is mislukt:", error);
    const rolledBack = await cleanUpPhotoFiles(created);
    redirect(fail(rolledBack ? PHOTO_FAILED_MESSAGE : PHOTO_ROLLBACK_MESSAGE));
  }

  const { data, error } = await unchanged(
    supabase
      .from("testimonials")
      .update({ photo_path: created.photo_path, photo_consent: true, avatar_media_id: created.avatar_media_id })
      .eq("id", id),
    snapshotOf(review)
  ).select("id");

  if (error || data.length !== 1) {
    const message = await rollBack(created, error);
    redirect(await editFailure(supabase, id, message));
  }

  // The old files have just lost their only reference. A library photo that
  // was linked before is only unlinked.
  const cleaned = await cleanUpPhotoFiles(review);

  revalidateSite();
  redirect(cleaned ? editUrl(id, "De foto is vervangen.") : fail(LEFTOVER_MESSAGE));
}

export async function deleteTestimonial(id: string, tab: TestimonialStatus) {
  await requireAdmin();
  const fail = (notice: string) => listUrl(tab, notice, "error");

  const supabase = await createClient();
  const review = await loadReview(supabase, id, fail);

  const { data, error } = await unchanged(
    supabase.from("testimonials").delete().eq("id", id),
    snapshotOf(review)
  ).select("id");

  if (error) {
    redirect(fail("Verwijderen is mislukt."));
  }
  if (data.length !== 1) {
    redirect(fail(STALE_MESSAGE));
  }

  const cleaned = await cleanUpPhotoFiles(review);

  revalidateSite();
  redirect(cleaned ? listUrl(tab, "Recensie verwijderd.") : fail(LEFTOVER_MESSAGE));
}

export async function cleanUpOrphanedPhotos(tab: TestimonialStatus) {
  await requireAdmin();

  let result: Awaited<ReturnType<typeof removeOrphanedPhotos>>;
  try {
    result = await removeOrphanedPhotos(await findOrphanedPhotos());
  } catch (error) {
    console.error("[testimonials] Opruimen is mislukt:", error);
    redirect(listUrl(tab, "Opruimen is mislukt. Probeer het later opnieuw.", "error"));
  }

  revalidateSite();
  redirect(
    result.failed > 0
      ? listUrl(tab, `${result.removed} bestand(en) opgeruimd, ${result.failed} niet. Probeer het later opnieuw.`, "error")
      : listUrl(tab, `${result.removed} bestand(en) opgeruimd.`)
  );
}

export async function setTestimonialsEnabled(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("testimonials_enabled") === "on";

  const supabase = await createClient();
  await supabase.from("site_settings").update({ testimonials_enabled: enabled }).eq("id", true);

  revalidateSite();
  redirect(
    "/admin/testimonials?notice=" +
      encodeURIComponent(enabled ? "Recensies staan op de homepage." : "Recensies staan niet meer op de homepage.")
  );
}
