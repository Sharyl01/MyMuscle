import { LegalPage } from "@/components/landing/legal-page";
import terms from "./terms-notice.json";

export default function TermsPage() {
  return <LegalPage locale="nl" title={terms.title} updatedAt={terms.version} sections={terms.sections} />;
}
