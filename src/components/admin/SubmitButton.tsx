"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children = "Opslaan",
  pendingLabel = "Opslaan...",
  variant = "primary",
  className,
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
        variant === "primary" && "bg-ink text-cream hover:bg-brown-dark",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={16} /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
