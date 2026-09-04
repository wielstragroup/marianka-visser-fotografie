import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ShootForm } from "../ShootForm";
import { updateShoot, deleteShoot } from "../actions";
import { getAllMedia, getShootById } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Shoot bewerken" };

export default async function EditShootPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const [shoot, media] = await Promise.all([getShootById(id), getAllMedia()]);

  if (!shoot) notFound();

  const boundUpdate = updateShoot.bind(null, id);
  const boundDelete = deleteShoot.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Shoot bewerken: ${shoot.name}`}
        action={<DeleteButton action={boundDelete} confirmMessage={`Weet je zeker dat je "${shoot.name}" wilt verwijderen?`} />}
      />
      <Notice notice={notice} type={type} />
      <ShootForm shoot={shoot} media={media} action={boundUpdate} />
    </div>
  );
}
