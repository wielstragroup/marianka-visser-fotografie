"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signIn } from "./actions";
import { inputClasses, FormField } from "@/components/ui/FormField";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brown-dark disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={16} /> Inloggen...
        </>
      ) : (
        "Inloggen"
      )}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, { error: null });

  return (
    <form action={formAction} className="space-y-5 rounded-sm border border-line bg-paper p-8">
      <input type="hidden" name="next" value={next} />

      <FormField label="E-mailadres" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClasses()} />
      </FormField>

      <FormField label="Wachtwoord" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClasses()}
        />
      </FormField>

      {state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
