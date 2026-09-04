import type { SubmissionStatus } from "@/lib/types/database.types";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  afgerond: "Afgerond",
  gearchiveerd: "Gearchiveerd",
};

export const STATUS_STYLES: Record<SubmissionStatus, string> = {
  nieuw: "bg-blush text-brown-dark",
  in_behandeling: "bg-amber-100 text-amber-800",
  afgerond: "bg-green-100 text-green-800",
  gearchiveerd: "bg-gray-100 text-gray-600",
};

export const STATUS_OPTIONS: SubmissionStatus[] = ["nieuw", "in_behandeling", "afgerond", "gearchiveerd"];
