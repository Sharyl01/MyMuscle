import type { Metadata } from "next";
import Link from "next/link";
import { WebsiteVisitTracker } from "@/components/analytics/website-visit-tracker";
import { AppIntroduction } from "@/components/marketing/app-introduction";
import { InteractiveHero } from "@/components/marketing/interactive-hero";
import {
  Overview,
  PersonalRecords,
  Achievements,
  Community,
  FinalCta,
} from "@/components/marketing/product-story";
import { StrengthProgress } from "@/components/marketing/strength-progress";
import { StorySectionSizing } from "@/components/marketing/story-section-sizing";
import s from "@/components/marketing/marketing.module.css";

const description =
  "Log your workouts. See your muscles respond. Explore MyMuscle’s interactive muscle map, strength progress, personal records, achievements, and training groups.";
export const metadata: Metadata = {
  title: { absolute: "MyMuscle — See your training." },
  description,
  alternates: { canonical: "https://mymuscle.app" },
  openGraph: {
    title: "MyMuscle — See your training.",
    description,
    url: "https://mymuscle.app",
    siteName: "MyMuscle",
    type: "website",
    images: [
      {
        url: "/marketing/social-preview.png",
        width: 1200,
        height: 630,
        alt: "MyMuscle — See your training. Interactive muscle tracking.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyMuscle — See your training.",
    description,
    images: ["/marketing/social-preview.png"],
  },
};

export default function Home() {
  return (
    <div className={s.site}>
      <WebsiteVisitTracker />
      <a className={s.skipLink} href="#main-content">
        Skip to content
      </a>
      <AppIntroduction />
      <main id="main-content">
        <StorySectionSizing />
        <InteractiveHero />
        <Overview />
        <StrengthProgress />
        <PersonalRecords />
        <Achievements />
        <Community />
        <FinalCta />
      </main>
      <footer className={s.footer}>
        <div>
          <Link href="/" className={s.brand}>
            MyMuscle
          </Link>
          <small>
            © {new Date().getUTCFullYear()} Apphletes · VOF · The Hague, the Netherlands
            <br />Chamber of Commerce 42133988 · VAT ID NL869874135B01
          </small>
        </div>
        <nav className={s.footerLinks} aria-label="Footer navigation">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@mymuscle.app">Get in touch ↗</a>
        </nav>
      </footer>
    </div>
  );
}
