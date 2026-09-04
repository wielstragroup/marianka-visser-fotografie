import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { PricingForm } from "../PricingForm";
import { createPricingPackage } from "../actions";
import { getAllShoots } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Nieuw tarief" };

export default async function NewPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const shoots = await getAllShoots();

  return (
    <div>
      <PageHeader title="Nieuw tarief" description="Voeg een nieuw pakket of tarief toe." />
      <Notice notice={notice} type={type} />
      <PricingForm shoots={shoots} action={createPricingPackage} />
    </div>
  );
}
