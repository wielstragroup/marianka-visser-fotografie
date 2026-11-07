import { z } from "zod";

export const REVIEW_MAX_LENGTH = 2000;

export const REVIEW_PHOTO_BUCKET = "testimonial-photos";
export const REVIEW_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Public review form. The status is deliberately not part of this schema:
// the route handler never reads one from the request, and RLS only accepts
// 'pending' from visitors regardless.
export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Vul je naam in.").max(120, "Je naam is te lang."),
  shootType: z.string().trim().max(120, "Het type fotoshoot is te lang.").optional().or(z.literal("")),
  rating: z
    .number({ error: "Kies een aantal sterren." })
    .int("Kies een aantal sterren.")
    .min(1, "Kies een aantal sterren.")
    .max(5, "Kies een aantal sterren."),
  review: z
    .string()
    .trim()
    .min(10, "Schrijf minimaal 10 tekens over je ervaring.")
    .max(REVIEW_MAX_LENGTH, `Je recensie mag maximaal ${REVIEW_MAX_LENGTH} tekens zijn.`),
  consent: z.literal(true, { error: "Geef toestemming om je naam en recensie te publiceren." }),
  // Honeypot: real visitors never fill this in. Any string passes validation
  // so the route can drop the submission silently instead of tipping off the
  // bot with an error.
  website: z.string().optional(),
  // Timestamp (ms) of when the form was rendered, used to drop suspiciously
  // instant submissions.
  renderedAt: z.number().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
