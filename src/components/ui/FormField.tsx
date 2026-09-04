import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brown focus:outline-none focus:ring-1 focus:ring-brown transition-colors";

export function FormField({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-soft">(optioneel)</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function inputClasses(hasError?: boolean) {
  return cn(fieldClasses, hasError && "border-red-400 focus:border-red-500 focus:ring-red-500");
}
