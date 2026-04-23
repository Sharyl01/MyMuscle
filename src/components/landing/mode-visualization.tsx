import Image from "next/image";

type Mode = {
  name: string;
  label: string;
  description: string;
  accent: string;
  accentSoft: string;
  backdrop: {
    primary: string;
    secondary: string;
  };
  asset: string;
  selected?: boolean;
  stats: Array<{
    label: string;
    value: string;
    tone: string;
  }>;
};

const modes: Mode[] = [
  {
    name: "Default",
    label: "Load history",
    description: "Shows where you recently trained and where overload is building up.",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.18)",
    backdrop: {
      primary: "rgba(37, 99, 235, 0.34)",
      secondary: "rgba(250, 204, 21, 0.22)",
    },
    asset: "/app-assets/body-default.svg",
    selected: true,
    stats: [
      { label: "Chest", value: "Trained", tone: "text-amber-200" },
      { label: "Quads", value: "Perfect", tone: "text-sky-200" },
      { label: "Risk", value: "Overload", tone: "text-rose-200" },
    ],
  },
  {
    name: "Recovery",
    label: "Readiness",
    description: "Shows which muscles are most likely ready to train again.",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.18)",
    backdrop: {
      primary: "rgba(34, 197, 94, 0.28)",
      secondary: "rgba(16, 185, 129, 0.22)",
    },
    asset: "/app-assets/body-recovery.svg",
    stats: [
      { label: "Push", value: "87%", tone: "text-emerald-200" },
      { label: "Pull", value: "92%", tone: "text-emerald-200" },
      { label: "Legs", value: "Hold", tone: "text-amber-200" },
    ],
  },
];

const legend = [
  { label: "Yellow", value: "Trained", color: "#facc15" },
  { label: "Green", value: "Optimal", color: "#22c55e" },
  { label: "Blue", value: "Perfect", color: "#60a5fa" },
  { label: "Red", value: "Overtrained", color: "#f87171" },
];

function ModeBody({ mode }: { mode: Mode }) {
  return (
    <div className="relative mx-auto h-[18.5rem] w-full max-w-[250px] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,27,0.92),rgba(3,7,18,0.97))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div
        className="absolute inset-x-0 top-0 h-28 opacity-70"
        style={{
          background: `linear-gradient(135deg, ${mode.backdrop.primary}, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 opacity-65"
        style={{
          background: `linear-gradient(315deg, ${mode.backdrop.secondary}, transparent 72%)`,
        }}
      />
      <div className="absolute inset-4 rounded-lg border border-white/[0.06] bg-zinc-950/25" />

      <Image
        src={mode.asset}
        alt={`${mode.name} muscle body map`}
        width={612}
        height={1017}
        sizes="(max-width: 768px) 64vw, 250px"
        priority={mode.selected}
        unoptimized
        className="relative z-10 mx-auto h-[106%] w-auto -translate-y-2 object-contain drop-shadow-[0_18px_42px_rgba(2,6,23,0.82)]"
      />

      <div className="pointer-events-none absolute inset-x-8 bottom-2 z-20 h-14 bg-gradient-to-t from-slate-950/62 to-transparent" />
    </div>
  );
}

function ModeCard({ mode }: { mode: Mode }) {
  return (
    <article
      className={`relative flex min-h-full flex-col overflow-hidden rounded-lg border p-4 transition duration-500 ${
        mode.selected
          ? "border-blue-400/55 bg-blue-500/10 shadow-[0_0_60px_rgba(59,130,246,0.16)]"
          : "border-emerald-300/22 bg-emerald-300/[0.045]"
      }`}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${mode.accent}, transparent)`,
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-px opacity-70"
        style={{
          background: `linear-gradient(180deg, transparent, ${mode.accentSoft}, transparent)`,
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {mode.label}
            </p>
            <h3 className="font-display mt-1 text-2xl font-semibold text-white">
              {mode.name}
            </h3>
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border ${
              mode.selected ? "border-blue-300/60" : "border-emerald-300/45"
            }`}
          >
            <span
              className={`h-3.5 w-3.5 rounded-full transition ${
                mode.selected
                  ? "shadow-[0_0_18px_rgba(96,165,250,0.55)]"
                  : "border border-emerald-300/50 bg-transparent"
              }`}
              style={mode.selected ? { backgroundColor: mode.accent } : undefined}
            />
          </div>
        </div>

        <ModeBody mode={mode} />

        <p className="mt-4 min-h-[4.5rem] text-sm leading-6 text-slate-300">{mode.description}</p>

        <div className="mt-auto grid gap-2">
          {mode.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2 text-sm"
            >
              <span className="truncate text-slate-400">{stat.label}</span>
              <span className={`shrink-0 font-semibold ${stat.tone}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ModeVisualization() {
  return (
    <div className="relative w-full max-w-[700px]">
      <div className="absolute inset-x-6 -top-3 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

      <div className="surface-card glow-border relative rounded-lg p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/70">
              Two visual modes
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Same workout history. Two smarter views.
            </h2>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold">
            <span className="rounded-full bg-blue-500 px-3 py-2 text-white">Default</span>
            <span className="px-3 py-2 text-emerald-100">Recovery</span>
          </div>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {modes.map((mode) => (
            <ModeCard key={mode.name} mode={mode} />
          ))}
        </div>

        <div className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-zinc-950/45 p-3 sm:grid-cols-2 xl:grid-cols-4">
          {legend.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
