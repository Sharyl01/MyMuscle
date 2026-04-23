import { AppShowcase } from "@/components/landing/app-showcase";
import { CountdownTimer } from "@/components/landing/countdown-timer";
import { CtaLink } from "@/components/landing/cta-link";
import { LandingBackground } from "@/components/landing/landing-background";
import { ModeVisualization } from "@/components/landing/mode-visualization";
import { SectionHeading } from "@/components/landing/section-heading";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { LAUNCH_DISPLAY } from "@/lib/launch";

const featureCards = [
  {
    index: "01",
    title: "Interactive Muscle Tracking",
    description:
      "Watch an interactive body map respond to every session so you instantly know which muscle groups are stressed, primed, or overdue for recovery.",
  },
  {
    index: "02",
    title: "Recovery Insights",
    description:
      "See muscle readiness at a glance with a clear color system that tells you when a region is trained, optimal, perfect, or overworked.",
  },
  {
    index: "03",
    title: "Gamified Progress",
    description:
      "Turn sessions, recovery quality, and strength consistency into a feedback loop that makes progress visible and motivating.",
  },
  {
    index: "04",
    title: "Smart Training Feedback",
    description:
      "Use immediate load signals to adjust volume, choose the right split, and make the next workout sharper instead of random.",
  },
];

const steps = [
  {
    number: "1",
    title: "Log your workout",
    description:
      "Capture sets, effort, and muscles involved in a session in a format built for serious training consistency.",
  },
  {
    number: "2",
    title: "See your muscles update instantly",
    description:
      "Your body visualization changes in real time so you can understand load distribution the second the workout is done.",
  },
  {
    number: "3",
    title: "Optimize your training and recovery",
    description:
      "Plan tomorrow with confidence using a visual snapshot of fatigue, balance, and readiness across the entire body.",
  },
];

const legend = [
  { label: "Yellow", meaning: "Trained", color: "#facc15" },
  { label: "Green", meaning: "Optimal", color: "#22c55e" },
  { label: "Blue", meaning: "Perfect", color: "#60a5fa" },
  { label: "Red", meaning: "Overtrained", color: "#f87171" },
];

const heroStats = [
  {
    value: "4",
    label: "Training states",
    description: "One color language for every recovery decision.",
  },
  {
    value: "1",
    label: "Interactive body map",
    description: "A full-body overview after every logged session.",
  },
  {
    value: "24/7",
    label: "Readable insights",
    description: "Built to tell you what to push and what to protect.",
  },
];

const proofCards = [
  {
    title: "Built for absolute beginners",
    body: "Start with a simple visual answer: what did I train, and what should I avoid today?",
  },
  {
    title: "Made for advanced lifters",
    body: "Use muscle-specific load and recovery signals to refine split decisions, volume, and progression.",
  },
];

const audienceSegments = [
  {
    label: "Beginner",
    body: "Simple color cues.",
  },
  {
    label: "Motivated",
    body: "Clear progression goals.",
  },
  {
    label: "Advanced",
    body: "Load and recovery detail.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <LandingBackground />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
              Launching {LAUNCH_DISPLAY}
            </span>

            <h1 className="font-display text-balance mt-6 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Track Your Muscle Growth
              <span className="mt-2 block bg-[linear-gradient(120deg,#ffffff_0%,#7dd3fc_36%,#34d399_68%,#facc15_100%)] bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>

            <p className="text-balance mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              MyMuscle helps lifters log workouts and instantly see an
              interactive human body that shows training load and recovery state
              by muscle group. Know what is trained, optimal, perfect, or
              overworked before your next session starts.
            </p>

            <div className="mt-8 max-w-2xl">
              <CountdownTimer />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <CtaLink href="#download">Download App</CtaLink>
              <CtaLink
                href="mailto:support@mymuscle.app?subject=Join%20the%20MyMuscle%20waitlist"
                variant="secondary"
              >
                Join Waitlist
              </CtaLink>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <article key={item.label} className="surface-card rounded-lg p-4">
                  <p className="font-display text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <ModeVisualization />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <SectionHeading
          eyebrow="Core features"
          title="Every workout becomes a body-level signal."
          description="Built for athletes who want a cleaner picture of training load, muscle readiness, and session quality before they choose what to do next."
          align="center"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="surface-card rounded-lg p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(250,204,21,0.2),rgba(52,211,153,0.22),rgba(96,165,250,0.18))] font-display text-lg font-semibold text-white">
                {feature.index}
              </div>
              <h3 className="font-display mt-6 text-2xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="From logged sessions to better decisions in three steps."
              description="The product is designed to keep the feedback loop obvious. Enter the workout, inspect the body map, then plan your next move with more precision."
            />

            <article className="surface-card mt-8 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Training color system
              </p>
              <div className="mt-5 space-y-3">
                {legend.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-slate-400">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-5">
            {steps.map((step) => (
              <article key={step.number} className="surface-card rounded-lg p-6 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(96,165,250,0.2),rgba(52,211,153,0.18))] font-display text-2xl font-semibold text-white">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="preview"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <SectionHeading
          eyebrow="App preview"
          title="Real app screens, redesigned for launch impact."
          description="Real MyMuscle screens framed for the website: body map, PR-log, weekly progress and badge progression, with cleaner spacing and a more premium launch presentation."
          align="center"
        />

        <AppShowcase />
      </section>

      <section
        id="social-proof"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <SectionHeading
          eyebrow="Social proof"
          title="Built for absolute beginners to very advanced lifters."
          description="MyMuscle stays simple when you are new, but gives motivated lifters enough detail to make smarter training decisions as they progress."
          align="center"
        />

        <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="surface-card rounded-lg p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Positioning
            </p>
            <h3 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Built for Motivated Lifters.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Whether you are learning your first split or fine-tuning years of
              training, MyMuscle keeps the next decision clear: train, recover,
              or adjust.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {audienceSegments.map((segment) => (
                <div
                  key={segment.label}
                  className="min-w-0 rounded-lg border border-white/8 bg-white/[0.035] p-4"
                >
                  <p className="font-display text-2xl font-semibold text-white">
                    {segment.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {segment.body}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            {proofCards.map((card) => (
              <article key={card.title} className="surface-card rounded-lg p-6 sm:p-7">
                <h3 className="font-display text-2xl font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="download"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="surface-card glow-border rounded-lg p-7 sm:p-9 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                Final CTA
              </p>
              <h2 className="font-display text-balance mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                Start Training Smarter Today
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Join the waitlist now and get notified when MyMuscle officially
                goes live on {LAUNCH_DISPLAY}. App Store and Google Play links
                can be swapped in here as soon as launch starts.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <CtaLink href="mailto:support@mymuscle.app?subject=Join%20the%20MyMuscle%20waitlist">
                Join the Waitlist
              </CtaLink>
              <CtaLink href="mailto:support@mymuscle.app" variant="secondary">
                Contact Support
              </CtaLink>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
