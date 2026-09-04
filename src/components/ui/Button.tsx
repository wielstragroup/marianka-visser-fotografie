import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-brown-dark border border-ink hover:border-brown-dark",
  secondary: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-cream",
  ghost: "bg-transparent text-ink border border-transparent hover:border-ink",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={cn(baseClasses, variantClasses[variant], className)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
