export function TravelCostNote({ text }: { text: string | null }) {
  if (!text) return null;

  return <p className="mt-8 text-center text-sm text-ink-soft">{text}</p>;
}
