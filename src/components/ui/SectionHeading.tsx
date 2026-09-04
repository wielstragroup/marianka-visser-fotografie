import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-brown uppercase">{eyebrow}</p>
      )}
      <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{description}</p>
      )}
    </div>
  );
}
