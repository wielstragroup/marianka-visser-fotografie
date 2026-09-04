import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal("")).transform((v) => (v ? v : null));
const optionalUuid = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));
const checkbox = z.union([z.literal("on"), z.literal("true")]).optional().transform((v) => Boolean(v));
const numberField = z.string().trim().transform((v) => Number(v));
const optionalNumberField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? Number(v) : null));

export const shootSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in."),
  slug: z
    .string()
    .trim()
    .min(1, "Vul een slug in.")
    .regex(/^[a-z0-9-]+$/, "Gebruik alleen kleine letters, cijfers en streepjes."),
  short_description: optionalText,
  long_description: optionalText,
  featured_image_id: optionalUuid,
  cta_label: optionalText,
  cta_url: optionalText,
  is_specialty: checkbox,
  sort_order: numberField,
  is_visible: checkbox,
  duration_label: optionalText,
  seo_title: optionalText,
  seo_description: optionalText,
});

export const pricingPackageSchema = z.object({
  name: z.string().trim().min(1, "Vul een pakketnaam in."),
  shoot_id: optionalUuid,
  price: z.string().trim().min(1, "Vul een prijs in.").transform((v) => Number(v)),
  photo_count: optionalNumberField,
  description: optionalText,
  extra_info: optionalText,
  is_featured: checkbox,
  sort_order: numberField,
  is_visible: checkbox,
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Vul een vraag in."),
  answer: z.string().trim().min(1, "Vul een antwoord in."),
  sort_order: numberField,
  is_visible: checkbox,
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in."),
  quote: z.string().trim().min(1, "Vul een tekst in."),
  rating: optionalNumberField,
  avatar_media_id: optionalUuid,
  sort_order: numberField,
  is_visible: checkbox,
});

export const availabilitySchema = z.object({
  id: z.string().uuid(),
  moment_label: z.string().trim().min(1, "Vul een moment in."),
  is_available: checkbox,
});

export const mediaMetaSchema = z.object({
  alt_text: z.string().trim().default(""),
  title: optionalText,
  description: optionalText,
  category: optionalText,
  shoot_id: optionalUuid,
  is_featured: checkbox,
  is_visible: checkbox,
  sort_order: numberField,
});

export const mediaPositionSchema = z.object({
  focal_x: z.number().min(0).max(100),
  focal_y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(3),
});

export const siteSettingsSchema = z.object({
  business_name: z.string().trim().min(1, "Vul een bedrijfsnaam in."),
  tagline: optionalText,
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  phone: optionalText,
  instagram_handle: optionalText,
  instagram_url: optionalText,
  domain: optionalText,
  location: optionalText,
  service_area: z
    .string()
    .trim()
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  footer_text: optionalText,
  testimonials_enabled: checkbox,
  logo_media_id: optionalUuid,
  favicon_media_id: optionalUuid,
  og_image_media_id: optionalUuid,
  seo_title_default: optionalText,
  seo_description_default: optionalText,
  travel_cost_text: optionalText,
});

export const overMijPageSchema = z.object({
  paragraphs: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    ),
  seo_title: optionalText,
  seo_description: optionalText,
});

export const homePageSchema = z.object({
  intro_text: optionalText,
  about_teaser_text: optionalText,
  shoots_quote: optionalText,
  seo_title: optionalText,
  seo_description: optionalText,
});
