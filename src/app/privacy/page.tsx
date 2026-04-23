import { LegalPage } from "@/components/landing/legal-page";

const sections = [
  {
    title: "Information we collect",
    body: [
      "MyMuscle may collect information you provide directly, including your name, email address, support requests, and workout data you choose to log inside the product.",
      "We may also collect technical information required to operate the service, such as device type, app version, crash diagnostics, and anonymous usage analytics.",
    ],
  },
  {
    title: "How we use your information",
    body: [
      "We use your information to deliver the product, personalize your experience, improve training insights, respond to support requests, and maintain platform security.",
      "If you join the waitlist or request launch updates, we may use your email address to send product announcements and onboarding information related to MyMuscle.",
    ],
  },
  {
    title: "Sharing and retention",
    body: [
      "We do not sell your personal information. We may share data with service providers that help us host, analyze, support, or secure the product, subject to appropriate safeguards.",
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
      updatedAt="April 21, 2026"
      sections={sections}
    />
  );
}
