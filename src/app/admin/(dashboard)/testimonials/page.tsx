import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Stars } from "@/components/testimonials/Stars";
import { getAllTestimonials, getMediaByIds, getSiteSettingsAdmin } from "@/lib/data/admin";
import { findOrphanedPhotos, getSignedPhotoUrls } from "@/lib/testimonial-photos";
import {
  TESTIMONIAL_STATUS_LABELS,
  TESTIMONIAL_STATUS_OPTIONS,
  TESTIMONIAL_STATUS_STYLES,
} from "@/lib/constants/testimonials";
import type { Testimonial, TestimonialStatus } from "@/lib/types/database.types";
import {
  cleanUpOrphanedPhotos,
  deleteTestimonial,
  removeTestimonialPhoto,
  retryPhotoUnpublish,
  setTestimonialsEnabled,
  setTestimonialStatus,
} from "./actions";

export const metadata: Metadata = { title: "Recensies" };

const EMPTY_MESSAGES: Record<TestimonialStatus, string> = {
  pending: "Er zijn geen nieuwe recensies om te beoordelen.",
  approved: "Er zijn nog geen gepubliceerde recensies.",
  rejected: "Er zijn geen afgewezen recensies.",
};

function averageRating(testimonials: Testimonial[]) {
  const ratings = testimonials.flatMap((t) => t.rating ?? []);
  if (ratings.length === 0) return "–";
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return average.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function ReviewActions({
  testimonial,
  tab,
  canPublish,
}: {
  testimonial: Testimonial;
  tab: TestimonialStatus;
  canPublish: boolean;
}) {
  const moveTo = (status: TestimonialStatus) => setTestimonialStatus.bind(null, testimonial.id, status, tab);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {tab !== "approved" && canPublish && (
        <ConfirmButton action={moveTo("approved")} variant="primary">
          Goedkeuren en publiceren
        </ConfirmButton>
      )}
      {tab === "pending" && (
        <ConfirmButton action={moveTo("rejected")} confirmMessage="Weet je zeker dat je deze recensie wilt afwijzen?">
          Afwijzen
        </ConfirmButton>
      )}
      {tab === "approved" && (
        <ConfirmButton
          action={moveTo("rejected")}
          confirmMessage="Deze recensie van de website halen? Je vindt hem daarna terug bij Afgewezen."
        >
          Offline halen
        </ConfirmButton>
      )}
      {tab === "rejected" && <ConfirmButton action={moveTo("pending")}>Opnieuw beoordelen</ConfirmButton>}
      <Link
        href={`/admin/testimonials/${testimonial.id}`}
        className="inline-flex items-center justify-center rounded-full border border-line bg-paper px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brown"
      >
        Bewerken
      </Link>
      {(testimonial.photo_path || testimonial.avatar_media_id) && (
        <ConfirmButton
          action={removeTestimonialPhoto.bind(null, testimonial.id, tab)}
          confirmMessage="De foto bij deze recensie verwijderen? De recensie zelf blijft staan."
        >
          Foto verwijderen
        </ConfirmButton>
      )}
      <DeleteButton
        action={deleteTestimonial.bind(null, testimonial.id, tab)}
        confirmMessage="Deze recensie definitief verwijderen? Dit kan niet ongedaan worden gemaakt."
      />
    </div>
  );
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string; type?: string }>;
}) {
  await requireAdmin();
  const { status, notice, type } = await searchParams;
  const tab = TESTIMONIAL_STATUS_OPTIONS.includes(status as TestimonialStatus)
    ? (status as TestimonialStatus)
    : "pending";

  const [testimonials, settings] = await Promise.all([getAllTestimonials(), getSiteSettingsAdmin()]);

  const byStatus = (s: TestimonialStatus) => testimonials.filter((t) => t.status === s);
  const shown = byStatus(tab);

  const [signedPhotos, libraryPhotos] = await Promise.all([
    getSignedPhotoUrls(shown.flatMap((t) => t.photo_path ?? [])),
    getMediaByIds(shown.flatMap((t) => (t.photo_path ? [] : (t.avatar_media_id ?? [])))),
  ]);
  const libraryUrls = new Map(libraryPhotos.map((m) => [m.id, m.url]));

  const photoUrl = (t: Testimonial) =>
    t.photo_path ? signedPhotos.get(t.photo_path)?.url : t.avatar_media_id ? libraryUrls.get(t.avatar_media_id) : null;
  const photoMissing = (t: Testimonial) => Boolean(t.photo_path || t.avatar_media_id) && !photoUrl(t);
  // Only approved reviews should have a public copy. Anything else means an
  // earlier cleanup failed halfway.
  // Files left behind by an interrupted action. A failed lookup just hides the
  // banner: it never blocks managing the reviews themselves.
  const orphans = await findOrphanedPhotos().catch((error) => {
    console.error("[testimonials] Zoeken naar achtergebleven foto's is mislukt:", error);
    return null;
  });
  const orphanCount = orphans ? orphans.publicCopies.length + orphans.privateFiles.length : 0;

  const stillPublic = (t: Testimonial) => t.status !== "approved" && Boolean(t.photo_path && t.avatar_media_id);

  const stats = [
    { label: "Nieuw", value: byStatus("pending").length },
    { label: "Gepubliceerd", value: byStatus("approved").length },
    { label: "Afgewezen", value: byStatus("rejected").length },
    { label: "Gemiddelde beoordeling", value: averageRating(byStatus("approved")) },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mariankavisserfotografie.nl";

  return (
    <div>
      <PageHeader
        title="Recensies"
        description="Bepaal welke recensies op de website komen. Nieuwe recensies zijn pas zichtbaar als jij ze goedkeurt."
        action={
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-brown-dark"
          >
            <Plus size={16} /> Nieuwe recensie
          </Link>
        }
      />

      <Notice notice={notice} type={type} />

      {orphanCount > 0 && (
        <div
          className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-amber-200 bg-amber-50 px-5 py-4"
          role="status"
        >
          <p className="text-sm text-amber-900">
            Er {orphanCount === 1 ? "staat 1 fotobestand" : `staan ${orphanCount} fotobestanden`} zonder recensie, achtergebleven
            na een onderbroken actie. Ze staan nergens op de site.
          </p>
          <ConfirmButton action={cleanUpOrphanedPhotos.bind(null, tab)}>Opruimen</ConfirmButton>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-sm border border-line bg-paper p-5">
            <p className="font-serif text-3xl text-ink">{stat.value}</p>
            <p className="text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TESTIMONIAL_STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/testimonials?status=${s}`}
            aria-current={tab === s ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium",
              tab === s ? "bg-ink text-cream" : "bg-blush-soft text-ink-soft hover:text-ink"
            )}
          >
            {TESTIMONIAL_STATUS_LABELS[s]} ({byStatus(s).length})
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-ink-soft">{EMPTY_MESSAGES[tab]}</p>
      ) : (
        <ul className="space-y-4">
          {shown.map((t) => (
            <li key={t.id} className="rounded-sm border border-line bg-paper p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 basis-56 items-center gap-4">
                  {photoUrl(t) && (
                    <a href={photoUrl(t)!} target="_blank" rel="noreferrer" className="shrink-0" title="Foto bekijken">
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs expire, so they can't go through next/image */}
                      <img src={photoUrl(t)!} alt={`Foto van ${t.name}`} className="h-16 w-16 rounded-full object-cover" />
                    </a>
                  )}
                  <div className="min-w-0">
                  <p className="font-medium wrap-anywhere text-ink">{t.name}</p>
                  <p className="text-xs text-ink-soft">
                    {t.shoot_type ?? "Geen shoot opgegeven"} &middot; ingestuurd op {formatDateTime(t.created_at)}
                  </p>
                  {t.photo_path && (
                    <p className="text-xs text-ink-soft">
                      {t.status === "approved"
                        ? "Foto staat op de website"
                        : "Foto is privé en komt pas online na goedkeuring (klant gaf toestemming)"}
                    </p>
                  )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TESTIMONIAL_STATUS_STYLES[t.status]}`}
                >
                  {TESTIMONIAL_STATUS_LABELS[t.status]}
                </span>
              </div>

              {t.rating && (
                <div className="mt-3">
                  <Stars rating={t.rating} />
                </div>
              )}

              <p className="mt-3 text-sm leading-relaxed wrap-anywhere whitespace-pre-line text-ink">{t.quote}</p>

              {photoMissing(t) && (
                <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  Deze recensie heeft een foto, maar die kon niet worden geladen. Ververs de pagina.
                  {t.status !== "approved" && " Publiceren kan pas als je de foto kunt zien."}
                </p>
              )}

              {stillPublic(t) && (
                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-sm text-red-700">De foto van deze recensie staat nog online.</p>
                  <ConfirmButton action={retryPhotoUnpublish.bind(null, t.id, tab)}>Opnieuw proberen</ConfirmButton>
                </div>
              )}

              <ReviewActions testimonial={t} tab={tab} canPublish={!photoMissing(t)} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 space-y-4">
        <div className="rounded-sm border border-line bg-blush-soft/50 px-5 py-4">
          <p className="text-sm font-medium text-ink">Link om naar klanten te sturen</p>
          <p className="mt-1 text-sm wrap-anywhere text-ink-soft">{siteUrl}/recensie-schrijven</p>
        </div>

        <form
          action={setTestimonialsEnabled}
          className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-blush-soft/50 px-5 py-4"
        >
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-sm font-medium text-ink">Recensies op de homepage tonen</p>
            <p className="text-xs text-ink-soft">
              Als dit uit staat, verdwijnt de recensiesectie van de homepage. De pagina Recensies blijft bestaan.
            </p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="testimonials_enabled"
              aria-label="Recensies op de homepage tonen"
              defaultChecked={settings?.testimonials_enabled ?? false}
              className="h-5 w-5 accent-brown"
            />
          </label>
          <SubmitButton className="shrink-0">Toepassen</SubmitButton>
        </form>
      </div>
    </div>
  );
}
