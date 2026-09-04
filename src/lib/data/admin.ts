import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SubmissionStatus } from "@/lib/types/database.types";

// Admin data access. Unlike lib/data/public.ts these deliberately do NOT
// filter by is_visible — the admin needs to see and manage draft/hidden
// content too. They rely on the request-scoped, cookie-bound client so RLS
// (is_admin()) is the actual gate, not just "this function looks admin-y".
// Every caller must still have passed requireAdmin() first.

export async function getDashboardStats() {
  const supabase = await createClient();

  const [shoots, media, faqs, submissions, newSubmissions] = await Promise.all([
    supabase.from("shoots").select("id", { count: "exact", head: true }),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase.from("faqs").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "nieuw"),
  ]);

  return {
    shootsCount: shoots.count ?? 0,
    mediaCount: media.count ?? 0,
    faqsCount: faqs.count ?? 0,
    submissionsCount: submissions.count ?? 0,
    newSubmissionsCount: newSubmissions.count ?? 0,
  };
}

export async function getRecentSubmissions(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllShoots() {
  const supabase = await createClient();
  const { data } = await supabase.from("shoots").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getShootById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("shoots").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllMedia(filters?: { category?: string; shootId?: string }) {
  const supabase = await createClient();
  let query = supabase.from("media").select("*").order("sort_order", { ascending: true });
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.shootId) query = query.eq("shoot_id", filters.shootId);
  const { data } = await query;
  return data ?? [];
}

export async function getMediaByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("media").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllPricingPackages() {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_packages").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getPricingPackageById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_packages").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllFaqs() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getFaqById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllTestimonials() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getTestimonialById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllAvailability() {
  const supabase = await createClient();
  const { data } = await supabase.from("availability").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAllSubmissions(filters?: { status?: SubmissionStatus }) {
  const supabase = await createClient();
  let query = supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  const { data } = await query;
  return data ?? [];
}

export async function getSubmissionById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_submissions").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getAllPages() {
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").order("slug", { ascending: true });
  return data ?? [];
}

export async function getPageBySlugAdmin(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).single();
  return data ?? null;
}

export async function getSiteSettingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).single();
  return data;
}
