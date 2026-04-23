import { LegalPage } from "@/components/landing/legal-page";

const sections = [
  {
    title: "Acceptance of terms",
    body: [
      "By accessing or using MyMuscle, you agree to these Terms of Service and any policies referenced here. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "Using the service",
    body: [
      "You agree to use MyMuscle lawfully and only for personal, non-commercial fitness tracking unless we explicitly authorize another use in writing.",
      "You are responsible for the accuracy of the information you enter and for keeping your account credentials secure.",
    ],
  },
  {
    title: "Health and training disclaimer",
    body: [
      "MyMuscle provides training-related insights for informational purposes only. It does not provide medical advice, diagnosis, or treatment.",
      "You should consult a qualified professional before making decisions that could affect your health, rehabilitation, or training safety.",
    ],
  },
  {
    title: "Availability and updates",
    body: [
      "We may modify, suspend, or discontinue any part of MyMuscle at any time. We may also update these terms as the product evolves.",
      "Continued use of the service after updated terms are posted means you accept the revised terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about these terms, contact support@mymuscle.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updatedAt="April 21, 2026"
      sections={sections}
    />
  );
}
