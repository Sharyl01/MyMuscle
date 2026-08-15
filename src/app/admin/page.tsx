import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/dashboard";
import { loadProductAnalytics } from "@/lib/admin/analytics";

export const metadata: Metadata = {
  title: "Product analytics",
  robots: { index: false, follow: false },
};

const allowedPeriods = new Set([7, 30, 90]);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const requestedDays = Number(
    Array.isArray(parameters.days) ? parameters.days[0] : parameters.days,
  );
  const days = allowedPeriods.has(requestedDays) ? requestedDays : 30;
  const { identity, analytics } = await loadProductAnalytics(days);

  return (
    <AdminDashboard username={identity.username} analytics={analytics} />
  );
}
