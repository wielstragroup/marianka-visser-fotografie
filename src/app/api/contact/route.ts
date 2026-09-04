import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json(
      { error: "Je hebt te veel aanvragen verstuurd. Probeer het over enkele minuten opnieuw." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: "Controleer de gemarkeerde velden.", fieldErrors }, { status: 400 });
  }

  const input = parsed.data;

  // Honeypot tripped — pretend success so the bot doesn't learn anything.
  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  // Submitted implausibly fast after the form rendered (< 2s): almost
  // certainly a bot filling every field programmatically.
  if (input.renderedAt && Date.now() - input.renderedAt < 2000) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const submission = {
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    shoot_id: input.shootId || null,
    shoot_name_snapshot: input.shootName || null,
    desired_date: input.desiredDate || null,
    availability_preference: input.availabilityPreference || null,
    how_found: input.howFound || null,
    message: input.message || null,
  };

  let { error } = await supabase.from("contact_submissions").insert(submission);

  // A stale/invalid shoot_id (e.g. the shoot was deleted between page load
  // and submit) would otherwise fail the whole submission on the foreign
  // key constraint — retry once without it rather than losing a real
  // visitor's message over a dropdown value that no longer matters.
  if (error?.code === "23503") {
    ({ error } = await supabase
      .from("contact_submissions")
      .insert({ ...submission, shoot_id: null }));
  }

  if (error) {
    console.error("[contact] Opslaan van aanvraag is mislukt:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het versturen. Probeer het opnieuw of mail ons direct." },
      { status: 500 }
    );
  }

  await sendContactNotification(input);

  return NextResponse.json({ ok: true });
}
