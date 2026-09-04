import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { UploadForm } from "./UploadForm";
import { getAllMedia } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Foto's" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;
  const media = await getAllMedia();

  return (
    <div>
      <PageHeader title="Foto's" description="De mediabibliotheek van de website." />
      <Notice notice={notice} type={type} />

      <UploadForm />

      {media.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">Er zijn nog geen foto&apos;s geüpload.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item) => (
            <Link
              key={item.id}
              href={`/admin/media/${item.id}`}
              className="group relative block aspect-square overflow-hidden rounded-sm border border-line bg-blush-soft"
            >
              <Image
                src={item.url}
                alt={item.alt_text || item.title || ""}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2">
                {item.is_featured && <Star size={13} className="text-cream" fill="currentColor" />}
                {!item.is_visible && <EyeOff size={13} className="text-cream" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
