import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import notice from "./privacy-notice.json";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" }, robots: { index: false } };

export default function PrivacyPage() {
  return <LegalPage locale="nl" title="Privacyverklaring" updatedAt={`${notice.updatedAt} · ${notice.version}`} sections={notice.sections} />;
}
