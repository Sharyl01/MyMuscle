import Image from "next/image";

type ShowcaseScreen = {
  title: string;
  eyebrow: string;
  description: string;
  src: string;
  accent: string;
  summary: string;
};

const screens: ShowcaseScreen[] = [
  {
    title: "Live Muscle Map",
    eyebrow: "Hoofdpagina",
    description: "The real body-map screen, framed with depth so the main feature becomes the hero visual.",
    src: "/app-screenshots/home.jpeg",
    accent: "#60a5fa",
    summary: "Main muscle visualization.",
  },
  {
    title: "PR-log",
    eyebrow: "Strength records",
    description: "A focused PR overview for tracking strength milestones without spreadsheet noise.",
    src: "/app-screenshots/pr-log.jpeg",
    accent: "#84cc16",
    summary: "Personal records in one place.",
  },
  {
    title: "Voortgang",
    eyebrow: "Weekly overview",
    description: "Weekly training load shown as a simple overview you can scan in seconds.",
    src: "/app-screenshots/progress.jpeg",
    accent: "#22d3ee",
    summary: "Week load and recovery context.",
  },
  {
    title: "Badges",
    eyebrow: "Medailles",
    description: "Collectible strength achievements that keep progression motivating.",
    src: "/app-screenshots/badges.jpeg",
    accent: "#a855f7",
    summary: "Medal progress for key lifts.",
  },
];

function ScreenshotCard({ screen, index }: { screen: ShowcaseScreen; index: number }) {
  const tiltClassName =
    index === 0
      ? "lg:-rotate-1"
      : index === 1
        ? "lg:rotate-1"
        : index === 2
          ? "lg:rotate-1"
          : "lg:-rotate-1";

  return (
    <article className="group relative min-w-0">
      <div
        className="absolute inset-x-8 top-0 h-px opacity-65 transition duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${screen.accent}, transparent)`,
        }}
      />

      <div className="surface-card relative flex h-full flex-col rounded-lg p-4 sm:p-5">
        <div className="mb-5 grid min-h-[8.5rem] gap-3 sm:grid-cols-[0.78fr_1fr] sm:items-start">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {screen.eyebrow}
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-white">
              {screen.title}
            </h3>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            {screen.description}
          </p>
        </div>

        <div className={`relative mx-auto mt-auto w-full max-w-[300px] transition duration-500 group-hover:-translate-y-2 ${tiltClassName}`}>
          <div
            className="absolute inset-x-2 -top-3 h-px opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent, ${screen.accent}, transparent)`,
            }}
          />

          <div className="relative overflow-hidden rounded-3xl border border-white/16 bg-zinc-950 p-2 shadow-[0_35px_95px_rgba(2,6,23,0.68)]">
            <div className="absolute left-1/2 top-4 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/15" />
            <div className="pointer-events-none absolute inset-2 z-10 rounded-3xl ring-1 ring-inset ring-white/10" />
            <div className="pointer-events-none absolute inset-x-2 top-2 z-10 h-24 rounded-t-3xl bg-gradient-to-b from-white/10 to-transparent" />

            <Image
              src={screen.src}
              alt={`${screen.title} screenshot from the MyMuscle app`}
              width={946}
              height={2048}
              sizes="(min-width: 1024px) 300px, 78vw"
              className="h-auto w-full rounded-3xl object-cover"
            />

            <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 h-32 rounded-b-3xl bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function AppShowcase() {
  return (
    <div className="mt-14">
      <div className="grid gap-6 lg:grid-cols-2">
        {screens.map((screen, index) => (
          <ScreenshotCard key={screen.title} screen={screen} index={index} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {screens.map((screen) => (
          <div key={`${screen.title}-summary`} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 h-1.5 w-16 rounded-full" style={{ backgroundColor: screen.accent }} />
            <p className="font-display text-lg font-semibold text-white">{screen.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{screen.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
