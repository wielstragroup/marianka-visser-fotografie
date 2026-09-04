import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 className="animate-spin text-brown" size={28} />
    </div>
  );
}
