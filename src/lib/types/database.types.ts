// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update this file to match (or regenerate with the
// Supabase CLI: `supabase gen types typescript`).

export type SubmissionStatus = "nieuw" | "in_behandeling" | "afgerond" | "gearchiveerd";

// Every entry needs `Relationships` for the Supabase client's generic
// constraints to resolve correctly (it must structurally match
// postgrest-js's GenericTable) — an empty tuple is fine since we never rely
// on FK-based embedded selects (`select("*, shoots(*)")`) in this codebase.
type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
  updated_at: string;
};

type SiteSettingsRow = {
  id: true;
  business_name: string;
  tagline: string | null;
  email: string;
  phone: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  domain: string | null;
  location: string | null;
  service_area: string[];
  logo_media_id: string | null;
  favicon_media_id: string | null;
  footer_text: string | null;
  testimonials_enabled: boolean;
  seo_title_default: string | null;
  seo_description_default: string | null;
  og_image_media_id: string | null;
  travel_cost_text: string | null;
  updated_at: string;
};

type ShootRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  featured_image_id: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_specialty: boolean;
  sort_order: number;
  is_visible: boolean;
  duration_label: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

type MediaRow = {
  id: string;
  storage_path: string;
  url: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string | null;
  alt_text: string;
  title: string | null;
  description: string | null;
  category: string | null;
  shoot_id: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  // Focal point (percentages, 0-100) + zoom (1-3) for CSS-based positioning
  // of `fill`-mode images (hero, etc). Defaults (50, 50, 1) reproduce plain
  // centered object-cover, so rows without an explicit crop are unaffected.
  focal_x: number;
  focal_y: number;
  zoom: number;
  created_at: string;
  updated_at: string;
};

type PricingPackageRow = {
  id: string;
  name: string;
  shoot_id: string | null;
  price: number;
  photo_count: number | null;
  description: string | null;
  extra_info: string | null;
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

type TestimonialRow = {
  id: string;
  name: string;
  quote: string;
  rating: number | null;
  avatar_media_id: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

type AvailabilityRow = {
  id: string;
  day_of_week: number;
  day_label: string;
  moment_label: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PageRow = {
  id: string;
  slug: string;
  title: string | null;
  content: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  og_image_id: string | null;
  updated_at: string;
};

type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  shoot_id: string | null;
  shoot_name_snapshot: string | null;
  desired_date: string | null;
  availability_preference: string | null;
  how_found: string | null;
  message: string | null;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        { id: string; email: string; full_name?: string | null; role?: "admin" },
        { email?: string; full_name?: string | null; role?: "admin" }
      >;
      site_settings: Table<SiteSettingsRow, Partial<SiteSettingsRow>, Partial<SiteSettingsRow>>;
      shoots: Table<ShootRow, Partial<ShootRow> & { name: string; slug: string }, Partial<ShootRow>>;
      media: Table<MediaRow, Partial<MediaRow> & { storage_path: string; url: string }, Partial<MediaRow>>;
      pricing_packages: Table<
        PricingPackageRow,
        Partial<PricingPackageRow> & { name: string; price: number },
        Partial<PricingPackageRow>
      >;
      faqs: Table<FaqRow, Partial<FaqRow> & { question: string; answer: string }, Partial<FaqRow>>;
      testimonials: Table<
        TestimonialRow,
        Partial<TestimonialRow> & { name: string; quote: string },
        Partial<TestimonialRow>
      >;
      availability: Table<
        AvailabilityRow,
        Partial<AvailabilityRow> & { day_of_week: number; day_label: string; moment_label: string },
        Partial<AvailabilityRow>
      >;
      pages: Table<PageRow, Partial<PageRow> & { slug: string }, Partial<PageRow>>;
      contact_submissions: Table<
        ContactSubmissionRow,
        Partial<ContactSubmissionRow> & { name: string; email: string },
        Partial<ContactSubmissionRow>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Shoot = Database["public"]["Tables"]["shoots"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];
export type PricingPackage = Database["public"]["Tables"]["pricing_packages"]["Row"];
export type Faq = Database["public"]["Tables"]["faqs"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type Availability = Database["public"]["Tables"]["availability"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
