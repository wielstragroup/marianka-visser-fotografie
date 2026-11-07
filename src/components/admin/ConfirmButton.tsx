"use client";

import { SubmitButton } from "@/components/admin/SubmitButton";

// A one-button form for a status change, optionally behind a confirm dialog.
export function ConfirmButton({
  action,
  confirmMessage,
  variant = "secondary",
  children,
}: {
  action: (formData: FormData) => void;
  confirmMessage?: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <SubmitButton variant={variant} pendingLabel="Bezig...">
        {children}
      </SubmitButton>
    </form>
  );
}
