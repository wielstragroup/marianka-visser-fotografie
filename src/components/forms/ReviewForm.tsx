"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { ReviewPhotoField } from "@/components/forms/ReviewPhotoField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { REVIEW_MAX_LENGTH } from "@/lib/validations/testimonial";

type FieldErrors = Record<string, string[] | undefined>;

const RATING_LABELS = ["Slecht", "Matig", "Goed", "Heel goed", "Uitstekend"];

export function ReviewForm({ shootTypes }: { shootTypes: string[] }) {
  const renderedAt = useRef<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrors({});
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("rating", String(rating));
    formData.set("consent", String(formData.get("consent") === "on"));
    formData.set("photoConsent", String(formData.get("photoConsent") === "on"));
    formData.set("renderedAt", String(renderedAt.current ?? ""));
    if (photo) formData.set("photo", photo, "foto.jpg");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setFormError("Er ging iets mis bij het versturen. Controleer je internetverbinding en probeer het opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-sm border border-line bg-paper px-8 py-16 text-center"
        role="status"
      >
        <CheckCircle2 className="text-brown" size={36} strokeWidth={1.5} />
        <h3 className="font-serif text-2xl text-ink">Bedankt voor je recensie!</h3>
        <p className="max-w-sm text-ink-soft">
          Marianka leest je recensie en plaatst hem daarna op de website.
        </p>
      </div>
    );
  }

  const shownRating = hoverRating || rating;

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
            maxLength={120}
            autoComplete="name"
            className={inputClasses(Boolean(errors.name))}
          />
        </FormField>

        <FormField label="Type fotoshoot" htmlFor="shootType" optional error={errors.shootType?.[0]}>
          <select id="shootType" name="shootType" className={inputClasses()} defaultValue="">
            <option value="">Kies een shoot</option>
            {shootTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Native radios behind the stars: arrow keys and screen readers work
          without any extra code. */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">Jouw beoordeling</legend>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex" onMouseLeave={() => setHoverRating(0)}>
            {RATING_LABELS.map((label, i) => {
              const value = i + 1;
              return (
                <label
                  key={value}
                  onMouseEnter={() => setHoverRating(value)}
                  className="cursor-pointer rounded-sm p-1 text-brown transition-transform hover:scale-110 has-focus-visible:ring-2 has-focus-visible:ring-brown"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    className="sr-only"
                  />
                  <span className="sr-only">
                    {value} {value === 1 ? "ster" : "sterren"}: {label}
                  </span>
                  <Star
                    size={32}
                    strokeWidth={1.5}
                    fill={value <= shownRating ? "currentColor" : "none"}
                    className={cn(value > shownRating && "text-brown/50")}
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>
          {shownRating > 0 && <span className="text-sm text-ink-soft">{RATING_LABELS[shownRating - 1]}</span>}
        </div>
        {errors.rating?.[0] && (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {errors.rating[0]}
          </p>
        )}
      </fieldset>

      <FormField label="Jouw recensie" htmlFor="review" error={errors.review?.[0]}>
        <textarea
          id="review"
          name="review"
          rows={6}
          required
          maxLength={REVIEW_MAX_LENGTH}
          placeholder="Hoe heb je de shoot ervaren?"
          className={inputClasses(Boolean(errors.review))}
        />
      </FormField>

      <ReviewPhotoField onChange={setPhoto} onPreparingChange={setIsPreparingPhoto} error={errors.photo?.[0]} />

      <div>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brown" />
          <span>Ik geef toestemming om mijn naam en recensie op deze website te publiceren.</span>
        </label>
        {errors.consent?.[0] && (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {errors.consent[0]}
          </p>
        )}
      </div>

      {photo && (
        <div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" name="photoConsent" className="mt-0.5 h-4 w-4 shrink-0 accent-brown" />
            <span>Ik geef toestemming om mijn foto bij mijn recensie op deze website te publiceren.</span>
          </label>
          {errors.photoConsent?.[0] && (
            <p className="mt-1.5 text-sm text-red-700" role="alert">
              {errors.photoConsent[0]}
            </p>
          )}
        </div>
      )}

      {formError && (
        <p className="text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting" || isPreparingPhoto} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="animate-spin" size={16} /> Versturen...
          </>
        ) : (
          "Recensie versturen"
        )}
      </Button>
    </form>
  );
}
