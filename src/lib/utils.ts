import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

// For a plain `date` value (e.g. "2026-03-15", no time component). Forces
// UTC on both the parse and the format: `new Date("2026-03-15")` parses as
// UTC midnight, and formatting that in a non-UTC server/browser timezone
// (e.g. US-based Vercel regions) can otherwise roll it back to the previous
// calendar day — showing the wrong date for something a visitor picked
// deliberately.
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
