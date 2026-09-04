import { z } from "zod";

// Dutch, human-readable error messages — never "Invalid input."
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in.").max(120, "Je naam is te lang."),
  email: z.string().trim().min(1, "Vul je e-mailadres in.").email("Vul een geldig e-mailadres in."),
  phone: z.string().trim().max(30, "Vul een geldig telefoonnummer in.").optional().or(z.literal("")),
  shootId: z.string().uuid().optional().or(z.literal("")),
  shootName: z.string().trim().max(120).optional().or(z.literal("")),
  // Matches the shape produced by <input type="date">. The DB column is a
  // real `date`, so a malformed value here would otherwise surface as a
  // raw Postgres error to a real visitor instead of a friendly message.
  desiredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vul een geldige datum in.")
    .optional()
    .or(z.literal("")),
  availabilityPreference: z.string().trim().max(200).optional().or(z.literal("")),
  howFound: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(4000, "Je bericht is te lang.").optional().or(z.literal("")),
  // Honeypot: real visitors never fill this in — bots that auto-fill every
  // field will, and we silently drop the submission.
  website: z.string().max(0).optional().or(z.literal("")),
  // Timestamp (ms) of when the form was rendered, used to reject
  // suspiciously instant submissions.
  renderedAt: z.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
