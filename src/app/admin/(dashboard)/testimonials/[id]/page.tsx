import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { TestimonialForm } from "../TestimonialForm";
import { updateTestimonial, deleteTestimonial } from "../actions";
import { getAllMedia, getTestimonialById } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Recensie bewerken" };

export default async function EditTestimonialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const [testimonial, media] = await Promise.all([getTestimonialById(id), getAllMedia()]);

  if (!testimonial) notFound();

  const boundUpdate = updateTestimonial.bind(null, id);
  const boundDelete = deleteTestimonial.bind(null, id);

  return (
    <div>
      <PageHeader title="Recensie bewerken" action={<DeleteButton action={boundDelete} />} />
      <Notice notice={notice} type={type} />
      <TestimonialForm testimonial={testimonial} media={media} action={boundUpdate} />
    </div>
  );
}
