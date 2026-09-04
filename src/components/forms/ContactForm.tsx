"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { Availability, Shoot } from "@/lib/types/database.types";

type FieldErrors = Record<string, string[] | undefined>;

export function ContactForm({
  shoots,
  availability,
}: {
  shoots: Shoot[];
  availability: Availability[];
}) {
  const renderedAt = useRef<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const shootId = String(formData.get("shootId") || "");
    const shootName = shoots.find((s) => s.id === shootId)?.name ?? "";

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      shootId: shootId || undefined,
      shootName: shootName || undefined,
      desiredDate: String(formData.get("desiredDate") || ""),
      availabilityPreference: String(formData.get("availabilityPreference") || ""),
      howFound: String(formData.get("howFound") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
      renderedAt: renderedAt.current ?? undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setFormError("Er ging iets mis bij het versturen. Controleer je internetverbinding en probeer het opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-line bg-paper px-8 py-16 text-center">
        <CheckCircle2 className="text-brown" size={36} strokeWidth={1.5} />
        <h3 className="font-serif text-2xl text-ink">Bedankt voor je aanvraag!</h3>
        <p className="max-w-sm text-ink-soft">Marianka neemt zo snel mogelijk contact met je op.</p>
      </div>
    );
  }

  const availableSlots = availability.filter((a) => a.is_available);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — hidden from real visitors via CSS, not `hidden`, so bots
          that skip hidden inputs still fill it in. */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Naam" htmlFor="name" error={errors.name?.[0]}>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClasses(Boolean(errors.name))}
          />
        </FormField>

        <FormField label="E-mail" htmlFor="email" error={errors.email?.[0]}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClasses(Boolean(errors.email))}
          />
        </FormField>

        <FormField label="Telefoonnummer" htmlFor="phone" optional error={errors.phone?.[0]}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClasses(Boolean(errors.phone))}
          />
        </FormField>

        <FormField label="Soort shoot" htmlFor="shootId" optional>
          <select id="shootId" name="shootId" className={inputClasses()} defaultValue="">
            <option value="">Kies een shoot</option>
            {shoots.map((shoot) => (
              <option key={shoot.id} value={shoot.id}>
                {shoot.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Gewenste datum" htmlFor="desiredDate" optional error={errors.desiredDate?.[0]}>
          <input id="desiredDate" name="desiredDate" type="date" className={inputClasses(Boolean(errors.desiredDate))} />
        </FormField>

        <FormField label="Beschikbaarheid / gewenst moment" htmlFor="availabilityPreference" optional>
          <select id="availabilityPreference" name="availabilityPreference" className={inputClasses()} defaultValue="">
            <option value="">Geen voorkeur</option>
            {availableSlots.map((slot) => (
              <option key={slot.id} value={`${slot.day_label} ${slot.moment_label}`}>
                {slot.day_label} {slot.moment_label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Hoe ben je bij Marianka terechtgekomen?" htmlFor="howFound" optional>
        <input
          id="howFound"
          name="howFound"
          type="text"
          placeholder="Bijvoorbeeld: Instagram, via een vriendin, Google..."
          className={inputClasses()}
        />
      </FormField>

      <FormField label="Bericht" htmlFor="message" optional error={errors.message?.[0]}>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Vertel iets over wat je in gedachten hebt..."
          className={inputClasses(Boolean(errors.message))}
        />
      </FormField>

      {formError && (
        <p className="text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="animate-spin" size={16} /> Versturen...
          </>
        ) : (
          "Versturen"
        )}
      </Button>
    </form>
  );
}
