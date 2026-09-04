import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FaqForm } from "../FaqForm";
import { updateFaq, deleteFaq } from "../actions";
import { getFaqById } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Vraag bewerken" };

export default async function EditFaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const faq = await getFaqById(id);

  if (!faq) notFound();

  const boundUpdate = updateFaq.bind(null, id);
  const boundDelete = deleteFaq.bind(null, id);

  return (
    <div>
      <PageHeader title="Vraag bewerken" action={<DeleteButton action={boundDelete} />} />
      <Notice notice={notice} type={type} />
      <FaqForm faq={faq} action={boundUpdate} />
    </div>
  );
}
