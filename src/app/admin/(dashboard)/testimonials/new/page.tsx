import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { TestimonialForm } from "../TestimonialForm";
import { createTestimonial } from "../actions";
import { getAllMedia } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Nieuwe recensie" };

export default async function NewTestimonialPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const media = await getAllMedia();

  return (
    <div>
      <PageHeader title="Nieuwe recensie" />
      <Notice notice={notice} type={type} />
      <TestimonialForm media={media} action={createTestimonial} />
    </div>
  );
}
