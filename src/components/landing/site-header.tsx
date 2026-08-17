import Link from "next/link";
import { WaitlistButton } from "@/components/landing/waitlist-button";

const navigationItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Preview", href: "#preview" },
  { label: "Waitlist", href: "#download" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-zinc-950/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#facc15,#34d399,#60a5fa)] text-sm font-black text-zinc-950 shadow-[0_16px_45px_rgba(45,212,191,0.28)]">
            M
          </span>
          <span className="min-w-0">
            <span className="font-display block text-lg font-semibold text-white">
              MyMuscle
            </span>
            <span className="hidden text-xs uppercase tracking-[0.22em] text-slate-400 sm:block">
              Visual training intelligence
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 text-sm text-slate-300 lg:flex"
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <WaitlistButton
          variant="secondary"
          className="hidden sm:inline-flex"
        >
          Join Waitlist
        </WaitlistButton>
      </div>
    </header>
  );
}
