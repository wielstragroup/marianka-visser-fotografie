import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { TESTIMONIAL_STATUS_LABELS } from "@/lib/constants/testimonials";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { TestimonialForm } from "../TestimonialForm";
import { ReplacePhotoForm } from "../ReplacePhotoForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteTestimonial, removeTestimonialPhoto, replaceTestimonialPhoto, updateTestimonial } from "../actions";
import { getAllMedia, getMediaByIds, getTestimonialById } from "@/lib/data/admin";
import { getSignedPhotoUrls } from "@/lib/testimonial-photos";

export const metadata: Metadata = { title: "Recensie bewerken" };

export default async function EditTestimonialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { notice, type } = await searchParams;
  const [testimonial, media] = await Promise.all([getTestimonialById(id), getAllMedia()]);

  if (!testimonial) notFound();

  const [signedPhotos, libraryPhotos] = await Promise.all([
    getSignedPhotoUrls(testimonial.photo_path ? [testimonial.photo_path] : []),
    getMediaByIds(!testimonial.photo_path && testimonial.avatar_media_id ? [testimonial.avatar_media_id] : []),
  ]);
  const photoUrl = testimonial.photo_path ? signedPhotos.get(testimonial.photo_path)?.url : libraryPhotos[0]?.url;
  const hasPhoto = Boolean(testimonial.photo_path || testimonial.avatar_media_id);

  const boundUpdate = updateTestimonial.bind(null, id);
  const boundDelete = deleteTestimonial.bind(null, id, testimonial.status);

  return (
    <div>
      <Link
        href={`/admin/testimonials?status=${testimonial.status}`}
        className="mb-4 inline-block text-sm text-brown hover:text-brown-dark"
      >
        &larr; Terug naar overzicht
      </Link>
      <PageHeader
        title="Recensie bewerken"
        description={`Status: ${TESTIMONIAL_STATUS_LABELS[testimonial.status]}`}
        action={<DeleteButton action={boundDelete} />}
      />
      <Notice notice={notice} type={type} />
      <TestimonialForm testimonial={testimonial} media={media} action={boundUpdate} />

      <section className="mt-12 max-w-xl border-t border-line pt-8">
        <h2 className="mb-4 font-serif text-lg text-ink">Foto</h2>

        {hasPhoto ? (
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noreferrer" title="Foto bekijken">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs expire, so they can't go through next/image */}
                <img src={photoUrl} alt={`Foto van ${testimonial.name}`} className="h-24 w-24 rounded-full object-cover" />
              </a>
            ) : (
              <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                Deze recensie heeft een foto, maar die kon niet worden geladen. Ververs de pagina.
              </p>
            )}
            <ConfirmButton
              action={removeTestimonialPhoto.bind(null, id, "edit")}
              confirmMessage="De foto bij deze recensie verwijderen? De recensie zelf blijft staan."
            >
              Foto verwijderen
            </ConfirmButton>
          </div>
        ) : (
          <p className="mb-6 text-sm text-ink-soft">Deze recensie heeft geen foto.</p>
        )}

        <ReplacePhotoForm action={replaceTestimonialPhoto.bind(null, id)} />
      </section>
    </div>
  );
}
