import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({ title, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(52,211,153,0.18)_0%,transparent_32%),linear-gradient(315deg,rgba(125,211,252,0.12)_0%,transparent_28%)]" />
      <div className="page-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-16 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 transition hover:border-sky-300/30 hover:text-white"
        >
          Back to home
        </Link>

        <div className="surface-card glow-border mt-8 rounded-lg p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/70">
            MyMuscle legal
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-slate-400">Last updated {updatedAt}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300 sm:text-base">
                  {section.body.map((paragraph, index) => (
                    <p key={`${section.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
