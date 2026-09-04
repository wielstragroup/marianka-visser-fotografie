import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { HeroPositionEditor } from "@/components/admin/HeroPositionEditor";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { getAllShoots, getMediaByIdAdmin } from "@/lib/data/admin";
import { deleteMedia, updateMediaMeta } from "../actions";
import { ReplaceMediaForm } from "../ReplaceMediaForm";

export const metadata: Metadata = { title: "Foto bewerken" };

const CATEGORY_SUGGESTIONS = [
  "portfolio",
  "hero",
  "portret",
  "loveshoot",
  "zwangerschap",
  "newborn",
  "gezin",
  "familie",
];

export default async function EditMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const [media, shoots] = await Promise.all([getMediaByIdAdmin(id), getAllShoots()]);

  if (!media) notFound();

  const boundUpdate = updateMediaMeta.bind(null, id);
  const boundDelete = deleteMedia.bind(null, id);

  return (
    <div>
      <PageHeader
        title="Foto bewerken"
        action={<DeleteButton action={boundDelete} confirmMessage="Weet je zeker dat je deze foto wilt verwijderen?" />}
      />
      <Notice notice={notice} type={type} />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-line bg-blush-soft">
            <Image src={media.url} alt={media.alt_text || ""} fill sizes="400px" className="object-cover" />
          </div>

          <ReplaceMediaForm mediaId={media.id} />

          <HeroPositionEditor media={media} />
        </div>

        <form action={boundUpdate} className="space-y-6">
          <FormField label="Alt-tekst" htmlFor="alt_text">
            <input
              id="alt_text"
              name="alt_text"
              defaultValue={media.alt_text}
              placeholder="Omschrijf wat er op de foto te zien is"
              className={inputClasses()}
            />
          </FormField>

          <FormField label="Titel" htmlFor="title" optional>
            <input id="title" name="title" defaultValue={media.title ?? ""} className={inputClasses()} />
          </FormField>

          <FormField label="Beschrijving" htmlFor="description" optional>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={media.description ?? ""}
              className={inputClasses()}
            />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Categorie" htmlFor="category" optional>
              <input
                id="category"
                name="category"
                list="category-suggestions"
                defaultValue={media.category ?? ""}
                className={inputClasses()}
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Gekoppelde shoot" htmlFor="shoot_id" optional>
              <select id="shoot_id" name="shoot_id" defaultValue={media.shoot_id ?? ""} className={inputClasses()}>
                <option value="">Geen</option>
                {shoots.map((shoot) => (
                  <option key={shoot.id} value={shoot.id}>
                    {shoot.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Volgorde" htmlFor="sort_order">
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={media.sort_order}
              className={inputClasses()}
            />
          </FormField>

          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={media.is_featured}
                className="h-4 w-4 accent-brown"
              />
              Uitgelicht (featured)
            </label>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="is_visible"
                defaultChecked={media.is_visible}
                className="h-4 w-4 accent-brown"
              />
              Zichtbaar op de website
            </label>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
