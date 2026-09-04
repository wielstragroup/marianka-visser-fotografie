"use client";

import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function DeleteButton({
  action,
  confirmMessage = "Weet je zeker dat je dit wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
  label = "Verwijderen",
}: {
  action: (formData: FormData) => void;
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <SubmitButton variant="danger" pendingLabel="Verwijderen...">
        <Trash2 size={15} /> {label}
      </SubmitButton>
    </form>
  );
}
