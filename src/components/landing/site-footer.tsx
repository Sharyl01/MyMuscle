import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 text-sm text-slate-400 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <a
          href="mailto:support@mymuscle.app"
          className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        >
          support@mymuscle.app
        </a>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/privacy"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
