import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { ShootForm } from "../ShootForm";
import { createShoot } from "../actions";
import { getAllMedia } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Nieuwe shoot" };

export default async function NewShootPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const media = await getAllMedia();

  return (
    <div>
      <PageHeader title="Nieuwe shoot" description="Voeg een nieuwe fotoshoot toe." />
      <Notice notice={notice} type={type} />
      <ShootForm media={media} action={createShoot} />
    </div>
  );
}
