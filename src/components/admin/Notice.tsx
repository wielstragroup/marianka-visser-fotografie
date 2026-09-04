import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Reads a plain ?notice=...&type=success|error query param set by a server
// action's redirect — the simplest possible "toast" that needs no client
// JS and survives a full page reload.
export function Notice({ notice, type }: { notice?: string; type?: string }) {
  if (!notice) return null;
  const isError = type === "error";

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-2 rounded-sm border px-4 py-3 text-sm",
        isError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-800"
      )}
      role="status"
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {notice}
    </div>
  );
}
