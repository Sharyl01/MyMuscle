import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { LandingBackground } from "@/components/landing/landing-background";
import { getAdminIdentity } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const identity = await getAdminIdentity();
  if (identity) redirect("/admin");
  const { password } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <LandingBackground />

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span aria-hidden>←</span>
          Terug naar MyMuscle
        </Link>

        <section className="surface-card glow-border rounded-2xl p-7 sm:p-9">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#facc15,#34d399,#60a5fa)] font-display text-lg font-black text-zinc-950">
              M
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-white">
                MyMuscle Insight
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Besloten beheeromgeving
              </p>
            </div>
          </div>

          <h1 className="font-display mt-8 text-3xl font-semibold text-white">
            Welkom terug
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Log in met je persoonlijke beheerdersaccount. Er is geen openbare
            registratie voor dit dashboard.
          </p>

          <LoginForm passwordUpdated={password === "updated"} />
        </section>
      </div>
    </main>
  );
}
