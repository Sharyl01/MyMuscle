"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LandingBackground } from "@/components/landing/landing-background";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <LandingBackground />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-16 text-center sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-200/75">
          Error
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300">
          The page failed to load. Try again, or return to the home page if the
          issue persists.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8fafc,#a7f3d0_44%,#7dd3fc)] px-7 py-3 text-sm font-extrabold !text-zinc-950 shadow-[0_18px_50px_rgba(45,212,191,0.2)] ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
