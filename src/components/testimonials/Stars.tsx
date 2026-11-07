import { Star } from "lucide-react";

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brown" role="img" aria-label={`${rating} van de 5 sterren`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}
