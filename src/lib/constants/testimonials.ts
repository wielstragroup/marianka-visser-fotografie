import type { TestimonialStatus } from "@/lib/types/database.types";

export const TESTIMONIAL_STATUS_OPTIONS: TestimonialStatus[] = ["pending", "approved", "rejected"];

export const TESTIMONIAL_STATUS_LABELS: Record<TestimonialStatus, string> = {
  pending: "Nieuw",
  approved: "Gepubliceerd",
  rejected: "Afgewezen",
};

export const TESTIMONIAL_STATUS_STYLES: Record<TestimonialStatus, string> = {
  pending: "bg-blush text-brown-dark",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-gray-100 text-gray-600",
};
