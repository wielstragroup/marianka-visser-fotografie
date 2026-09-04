import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { FaqForm } from "../FaqForm";
import { createFaq } from "../actions";

export const metadata: Metadata = { title: "Nieuwe vraag" };

export default async function NewFaqPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;

  return (
    <div>
      <PageHeader title="Nieuwe vraag" description="Voeg een nieuwe veelgestelde vraag toe." />
      <Notice notice={notice} type={type} />
      <FaqForm action={createFaq} />
    </div>
  );
}
