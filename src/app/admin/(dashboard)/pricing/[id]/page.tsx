import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PricingForm } from "../PricingForm";
import { updatePricingPackage, deletePricingPackage } from "../actions";
import { getAllShoots, getPricingPackageById } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Tarief bewerken" };

export default async function EditPricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const [pkg, shoots] = await Promise.all([getPricingPackageById(id), getAllShoots()]);

  if (!pkg) notFound();

  const boundUpdate = updatePricingPackage.bind(null, id);
  const boundDelete = deletePricingPackage.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Tarief bewerken: ${pkg.name}`}
        action={<DeleteButton action={boundDelete} confirmMessage={`Weet je zeker dat je "${pkg.name}" wilt verwijderen?`} />}
      />
      <Notice notice={notice} type={type} />
      <PricingForm pkg={pkg} shoots={shoots} action={boundUpdate} />
    </div>
  );
}
