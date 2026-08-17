import { LegalPage } from "@/components/landing/legal-page";

const sections = [
  {
    title: "Information we collect",
    body: [
      "MyMuscle may collect information you provide directly, including your name, email address, support requests, and workout data you choose to log inside the product.",
      "We may also collect technical and product-usage information required to operate and improve the service, such as platform, app version, which product feature was opened, and small interaction counts. We do not include workout contents, weights, messages, or email addresses in product-usage events.",
      "When you visit mymuscle.app, we count page views and browser sessions using a random session identifier stored for the duration of the browser session. This website metric does not store your IP address, user-agent, or an advertising identifier.",
    ],
  },
  {
    title: "How we use your information",
    body: [
      "We use your information to deliver the product, personalize your experience, improve training insights, respond to support requests, and maintain platform security.",
      "Product-usage events are used in aggregated reports to understand which features are useful, evaluate product improvements, and identify features that may need clearer discovery or simplification.",
      "If you join the waitlist or request launch updates, we may use your email address to send product announcements and onboarding information related to MyMuscle.",
    ],
  },
  {
    title: "Sharing and retention",
    body: [
      "We do not sell your personal information. We may share data with service providers that help us host, analyze, support, or secure the product, subject to appropriate safeguards.",
      "Product-usage events are stored with a pseudonymous account identifier in our Supabase environment. The internal dashboard exposes aggregated results rather than individual event histories.",
      "Waitlist email addresses and privacy-minimized website visit records are stored in our Supabase environment. Website reporting in the internal dashboard is aggregated.",
      "We retain information only as long as necessary for the purposes described in this policy, unless a longer retention period is required by law.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can request access, correction, or deletion of your personal information by contacting support@mymuscle.app.",
      "You can also opt out of non-essential product emails at any time using the unsubscribe option included in those messages.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt="August 17, 2026"
      sections={sections}
    />
  );
}
