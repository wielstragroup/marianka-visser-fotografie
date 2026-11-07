import { NextResponse, type NextRequest } from "next/server";
import { reviewSchema, REVIEW_PHOTO_MAX_BYTES } from "@/lib/validations/testimonial";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";
import { readReviewPhoto, removePrivatePhoto, storePrivatePhoto, type ReviewPhoto } from "@/lib/testimonial-photos";

const TOO_MANY_MESSAGE = "Er zijn net veel recensies verstuurd. Probeer het later nog eens.";
const SAVE_FAILED_MESSAGE = "Er ging iets mis bij het versturen. Probeer het later opnieuw.";

// Room for the text fields on top of the largest allowed photo.
const MAX_BODY_BYTES = REVIEW_PHOTO_MAX_BYTES + 64 * 1024;

function fieldError(field: string, message: string) {
  return NextResponse.json(
    { error: "Controleer de gemarkeerde velden.", fieldErrors: { [field]: [message] } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return fieldError("photo", "Je foto is te groot. De maximale grootte is 5 MB.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };

  const parsed = reviewSchema.safeParse({
    name: text("name"),
    shootType: text("shootType"),
    rating: Number(text("rating")),
    review: text("review"),
    consent: text("consent") === "true",
    website: text("website"),
    renderedAt: Number(text("renderedAt")) || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Controleer de gemarkeerde velden.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Honeypot tripped or submitted implausibly fast (< 2s after render):
  // pretend success so the bot doesn't learn anything.
  if (input.website || (input.renderedAt && Date.now() - input.renderedAt < 2000)) {
    return NextResponse.json({ ok: true });
  }

  let photo: ReviewPhoto | null = null;
  const file = form.get("photo");

  if (file instanceof File && file.size > 0) {
    const result = await readReviewPhoto(file);
    if ("error" in result) return fieldError("photo", result.error);

    if (text("photoConsent") !== "true") {
      return fieldError("photoConsent", "Geef toestemming om je foto te publiceren, of verwijder de foto.");
    }

    photo = result;
  }

  // Checked after validation so a visitor fixing typos in the form doesn't
  // use up their attempts.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`testimonial:${ip}`)) {
    return NextResponse.json({ error: TOO_MANY_MESSAGE }, { status: 429 });
  }

  // The file is only stored now, together with its review, so an abandoned
  // form can't leave an orphaned upload behind.
  let photoPath: string | null = null;
  let supabase;

  try {
    if (photo) photoPath = await storePrivatePhoto(photo);
    // Visitors can't set photo fields through RLS, so a review with a photo
    // has to be inserted with the service role. Every value below is set here
    // on the server, none of it comes straight from the request.
    supabase = photoPath ? createAdminClient() : await createClient();
  } catch (error) {
    console.error("[testimonials] Opslaan van foto is mislukt:", error);
    return NextResponse.json({ error: SAVE_FAILED_MESSAGE }, { status: 500 });
  }

  const { error } = await supabase.from("testimonials").insert({
    name: input.name,
    shoot_type: input.shootType || null,
    rating: input.rating,
    quote: input.review,
    publication_consent: true,
    photo_path: photoPath,
    photo_consent: photoPath !== null,
    status: "pending",
  });

  if (error) {
    await removePrivatePhoto(photoPath).catch((cleanupError) => {
      console.error("[testimonials] Opruimen van foto is mislukt:", cleanupError);
    });
  }

  if (error?.code === "MV429") {
    return NextResponse.json({ error: TOO_MANY_MESSAGE }, { status: 429 });
  }

  if (error) {
    console.error("[testimonials] Opslaan van recensie is mislukt:", error);
    return NextResponse.json({ error: SAVE_FAILED_MESSAGE }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
