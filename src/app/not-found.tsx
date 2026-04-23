import Link from "next/link";
import { LandingBackground } from "@/components/landing/landing-background";
import { SiteHeader } from "@/components/landing/site-header";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <LandingBackground />
      <SiteHeader />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-16 text-center sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/70">
          404
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300">
          The page you are looking for is not available. Return to the landing
          page to see the MyMuscle launch preview.
        </p>
        <Link
          href="/"
          className="mx-auto mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8fafc,#a7f3d0_44%,#7dd3fc)] px-7 py-3 text-sm font-extrabold !text-zinc-950 shadow-[0_18px_50px_rgba(45,212,191,0.2)] ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
