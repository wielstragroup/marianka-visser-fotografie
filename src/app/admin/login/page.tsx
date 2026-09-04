import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl text-ink">Marianka Visser Fotografie</h1>
          <p className="mt-2 text-sm text-ink-soft">Dashboard</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
