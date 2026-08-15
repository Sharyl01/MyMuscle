import Link from "next/link";

import { logout } from "@/app/admin/actions";
import type {
  DailyMetric,
  EventTypeMetric,
  FeatureMetric,
  PlatformMetric,
  ProductAnalytics,
} from "@/lib/admin/analytics";

const numberFormatter = new Intl.NumberFormat("nl-NL");
const compactNumberFormatter = new Intl.NumberFormat("nl-NL", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
});
const dateTimeFormatter = new Intl.DateTimeFormat("nl-NL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Amsterdam",
});

const eventLabels: Record<string, string> = {
  feature_opened: "Functie geopend",
  feature_configured: "Functie ingesteld",
  workout_logged: "Workout gelogd",
  preset_applied: "Preset toegepast",
  personal_record_logged: "PR toegevoegd",
};

const platformLabels: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  unknown: "Onbekend",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Nog niet gebruikt";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
};

function Trend({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-slate-500">Geen vorige periode</span>;
  }

  const positive = value > 0;
  const neutral = value === 0;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        neutral
          ? "bg-white/6 text-slate-400"
          : positive
            ? "bg-emerald-400/10 text-emerald-200"
            : "bg-amber-400/10 text-amber-200"
      }`}
    >
      {positive ? "+" : ""}
      {value}% t.o.v. vorige periode
    </span>
  );
}

function MetricCard({
  eyebrow,
  value,
  description,
  trend,
  accent,
}: {
  eyebrow: string;
  value: number;
  description: string;
  trend?: number | null;
  accent: string;
}) {
  return (
    <article className="surface-card rounded-2xl p-5 sm:p-6">
      <div className={`h-1 w-12 rounded-full ${accent}`} />
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>
      <p className="font-display mt-2 text-4xl font-semibold text-white">
        {numberFormatter.format(value)}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {trend !== undefined ? (
        <div className="mt-4">
          <Trend value={trend} />
        </div>
      ) : null}
    </article>
  );
}

function ActivityChart({ daily }: { daily: DailyMetric[] }) {
  const width = 960;
  const height = 230;
  const horizontalPadding = 18;
  const verticalPadding = 18;
  const maxEvents = Math.max(1, ...daily.map((entry) => entry.events));
  const step = daily.length > 1 ? (width - horizontalPadding * 2) / (daily.length - 1) : 0;
  const points = daily.map((entry, index) => {
    const x = horizontalPadding + index * step;
    const y =
      height -
      verticalPadding -
      (entry.events / maxEvents) * (height - verticalPadding * 2);
    return { x, y, entry };
  });
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = points.length
    ? `${horizontalPadding},${height - verticalPadding} ${line} ${
        width - horizontalPadding
      },${height - verticalPadding}`
    : "";
  const middleIndex = Math.floor((daily.length - 1) / 2);

  return (
    <div>
      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/8 bg-black/20 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Aantal functie-events per dag"
          className="h-56 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((position) => (
            <line
              key={position}
              x1="0"
              x2={width}
              y1={height * position}
              y2={height * position}
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {area ? <polygon points={area} fill="url(#activity-fill)" /> : null}
          {line ? (
            <polyline
              points={line}
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {points.map(({ x, y, entry }) => (
            <circle key={entry.day} cx={x} cy={y} r="4" fill="#f8fafc">
              <title>
                {formatDate(entry.day)}: {entry.events} events, {entry.users} gebruikers
              </title>
            </circle>
          ))}
        </svg>
      </div>
      {daily.length ? (
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>{formatDate(daily[0].day)}</span>
          <span>{formatDate(daily[middleIndex].day)}</span>
          <span>{formatDate(daily[daily.length - 1].day)}</span>
        </div>
      ) : null}
    </div>
  );
}

function FeatureTable({ features }: { features: FeatureMetric[] }) {
  const maxEvents = Math.max(1, ...features.map((feature) => feature.events));

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
            <th className="border-b border-white/8 px-3 py-3 font-semibold">Functie</th>
            <th className="border-b border-white/8 px-3 py-3 font-semibold">Gebruik</th>
            <th className="border-b border-white/8 px-3 py-3 text-right font-semibold">Events</th>
            <th className="border-b border-white/8 px-3 py-3 text-right font-semibold">Gebruikers</th>
            <th className="border-b border-white/8 px-3 py-3 text-right font-semibold">Aandeel</th>
            <th className="border-b border-white/8 px-3 py-3 text-right font-semibold">Laatst</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.featureKey} className="group text-sm text-slate-300">
              <td className="border-b border-white/6 px-3 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-display text-xs text-slate-400">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">
                      {feature.displayName}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {feature.category}
                    </span>
                  </span>
                </div>
              </td>
              <td className="w-[28%] border-b border-white/6 px-3 py-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#60a5fa)]"
                    style={{ width: `${(feature.events / maxEvents) * 100}%` }}
                  />
                </div>
              </td>
              <td className="border-b border-white/6 px-3 py-4 text-right font-semibold text-slate-100">
                {numberFormatter.format(feature.events)}
              </td>
              <td className="border-b border-white/6 px-3 py-4 text-right">
                {numberFormatter.format(feature.users)}
              </td>
              <td className="border-b border-white/6 px-3 py-4 text-right">
                {feature.sharePercentage}%
              </td>
              <td className="border-b border-white/6 px-3 py-4 text-right text-xs text-slate-500">
                {formatDateTime(feature.lastUsedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistributionList({
  platforms,
  totalEvents,
}: {
  platforms: PlatformMetric[];
  totalEvents: number;
}) {
  if (!platforms.length) {
    return <p className="mt-5 text-sm text-slate-500">Nog geen platformdata.</p>;
  }

  return (
    <div className="mt-5 space-y-4">
      {platforms.map((platform) => {
        const percentage = totalEvents
          ? Math.round((platform.events / totalEvents) * 100)
          : 0;
        return (
          <div key={platform.platform}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-200">
                {platformLabels[platform.platform] ?? platform.platform}
              </span>
              <span className="text-slate-500">
                {numberFormatter.format(platform.events)} · {percentage}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#34d399)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventList({ eventTypes }: { eventTypes: EventTypeMetric[] }) {
  if (!eventTypes.length) {
    return <p className="mt-5 text-sm text-slate-500">Nog geen actiegegevens.</p>;
  }

  return (
    <div className="mt-5 divide-y divide-white/6">
      {eventTypes.map((event) => (
        <div key={event.eventName} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {eventLabels[event.eventName] ?? event.eventName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {numberFormatter.format(event.users)} unieke gebruikers
            </p>
          </div>
          <p className="font-display text-lg font-semibold text-white">
            {compactNumberFormatter.format(event.events)}
          </p>
        </div>
      ))}
    </div>
  );
}

const leastUsedFeature = (features: FeatureMetric[]) =>
  features.reduce<FeatureMetric | null>((least, feature) => {
    if (!least) return feature;
    if (feature.events < least.events) return feature;
    if (feature.events === least.events && feature.users < least.users) return feature;
    return least;
  }, null);

export function AdminDashboard({
  username,
  analytics,
}: {
  username: string;
  analytics: ProductAnalytics;
}) {
  const mostUsed = analytics.features.find((feature) => feature.events > 0) ?? null;
  const leastUsed = leastUsedFeature(analytics.features);
  const generatedAt = formatDateTime(analytics.generatedAt);

  return (
    <main className="min-h-screen bg-[#050607] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_90%_8%,rgba(96,165,250,0.12),transparent_25%)]" />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050607]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#facc15,#34d399,#60a5fa)] font-display text-sm font-black text-zinc-950">
              M
            </span>
            <span>
              <span className="font-display block text-base font-semibold text-white sm:text-lg">
                MyMuscle Insight
              </span>
              <span className="hidden text-xs uppercase tracking-[0.18em] text-slate-500 sm:block">
                Product analytics
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">
              Ingelogd als <strong className="text-slate-200">{username}</strong>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1500px] px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
              Productoverzicht
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Wat gebruiken je sporters echt?
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Vergelijk bereik en frequentie per functie. Gebruik dit als signaal voor
              premiumtests of vereenvoudiging, niet als enige beslisfactor.
            </p>
          </div>

          <div>
            <div className="inline-flex rounded-xl border border-white/8 bg-white/[0.025] p-1">
              {[7, 30, 90].map((period) => (
                <Link
                  key={period}
                  href={{ pathname: "/admin", query: { days: String(period) } }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    period === analytics.periodDays
                      ? "bg-white text-zinc-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {period} dagen
                </Link>
              ))}
            </div>
            <p className="mt-2 text-right text-xs text-slate-600">
              Bijgewerkt {generatedAt}
            </p>
          </div>
        </div>

        {analytics.totals.events === 0 ? (
          <div className="mt-8 rounded-2xl border border-sky-300/15 bg-sky-300/[0.06] px-5 py-4 text-sm leading-6 text-sky-100/80">
            De meetlaag staat klaar. Zodra gebruikers een nieuwe appbuild openen,
            verschijnt hier de eerste gebruiksdata.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            eyebrow="Functie-events"
            value={analytics.totals.events}
            description={`Alle gemeten interacties in ${analytics.periodDays} dagen.`}
            trend={analytics.totals.eventsChangePercentage}
            accent="bg-emerald-400"
          />
          <MetricCard
            eyebrow="Actieve gebruikers"
            value={analytics.totals.uniqueUsers}
            description="Unieke sporters die minimaal één functie gebruikten."
            trend={analytics.totals.usersChangePercentage}
            accent="bg-sky-400"
          />
          <MetricCard
            eyebrow="Vandaag actief"
            value={analytics.totals.activeUsersToday}
            description="Unieke actieve sporters sinds 00:00 Nederlandse tijd."
            accent="bg-yellow-400"
          />
          <MetricCard
            eyebrow="Geregistreerd"
            value={analytics.totals.registeredUsers}
            description="Totaal aantal aangemaakte appprofielen."
            accent="bg-violet-400"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <article className="surface-card rounded-2xl p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Activiteit
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-white">
                  Gebruik door de tijd
                </h2>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                Nederlandse tijd
              </span>
            </div>
            <ActivityChart daily={analytics.daily} />
          </article>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <article className="surface-card rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
                Premiumsignaal
              </p>
              <h2 className="font-display mt-3 text-2xl font-semibold text-white">
                {mostUsed?.displayName ?? "Nog geen kandidaat"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {mostUsed
                  ? `${numberFormatter.format(mostUsed.users)} gebruikers en ${numberFormatter.format(mostUsed.events)} events. Hoog bereik maakt dit geschikt voor een betalingsbereidheidstest.`
                  : "Verzamel eerst voldoende gebruiksdata voordat je een premiumtest kiest."}
              </p>
            </article>

            <article className="surface-card rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                Onderzoekssignaal
              </p>
              <h2 className="font-display mt-3 text-2xl font-semibold text-white">
                {leastUsed?.displayName ?? "Nog geen kandidaat"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {leastUsed
                  ? `${numberFormatter.format(leastUsed.events)} events in deze periode. Controleer vindbaarheid en gebruikerswaarde voordat je deze functie verwijdert.`
                  : "Er zijn nog geen functies om te vergelijken."}
              </p>
            </article>
          </div>
        </section>

        <section className="surface-card mt-6 rounded-2xl p-5 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Functieranglijst
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white">
              Meest tot minst gebruikt
            </h2>
          </div>
          <FeatureTable features={analytics.features} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="surface-card rounded-2xl p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Platformverdeling
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white">
              Waar wordt MyMuscle gebruikt?
            </h2>
            <DistributionList
              platforms={analytics.platforms}
              totalEvents={analytics.totals.events}
            />
          </article>

          <article className="surface-card rounded-2xl p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Actiediepte
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white">
              Kijken versus echt gebruiken
            </h2>
            <EventList eventTypes={analytics.eventTypes} />
          </article>
        </section>
      </div>
    </main>
  );
}
