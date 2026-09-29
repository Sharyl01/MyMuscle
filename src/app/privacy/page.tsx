import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import notice from "./privacy-notice.json";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" }, robots: { index: false } };

export default function PrivacyPage() {
  return <LegalPage title="Privacyverklaring" updatedAt={`${notice.status} · ${notice.version}`} sections={notice.sections} />;
}
