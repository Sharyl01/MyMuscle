import "server-only";

import { requireAdmin, type AdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export type AnalyticsTotals = {
  events: number;
  uniqueUsers: number;
  registeredUsers: number;
  activeUsersToday: number;
  previousEvents: number;
  previousUniqueUsers: number;
  eventsChangePercentage: number | null;
  usersChangePercentage: number | null;
};

export type FeatureMetric = {
  featureKey: string;
  displayName: string;
  category: string;
  events: number;
  users: number;
  sharePercentage: number;
  lastUsedAt: string | null;
};

export type DailyMetric = {
  day: string;
  events: number;
  users: number;
};

export type PlatformMetric = {
  platform: string;
  events: number;
  users: number;
};

export type EventTypeMetric = {
  eventName: string;
  events: number;
  users: number;
};

export type ProductAnalytics = {
  periodDays: number;
  generatedAt: string;
  totals: AnalyticsTotals;
  features: FeatureMetric[];
  daily: DailyMetric[];
  platforms: PlatformMetric[];
  eventTypes: EventTypeMetric[];
};

type DashboardData = {
  identity: AdminIdentity;
  analytics: ProductAnalytics;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asNumber = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asNullableNumber = (value: unknown): number | null =>
  value === null || value === undefined ? null : asNumber(value);

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const parseAnalytics = (value: unknown): ProductAnalytics => {
  const source = asRecord(value);
  const totals = asRecord(source.totals);

  return {
    periodDays: asNumber(source.period_days) || 30,
    generatedAt: asString(source.generated_at, new Date().toISOString()),
    totals: {
      events: asNumber(totals.events),
      uniqueUsers: asNumber(totals.unique_users),
      registeredUsers: asNumber(totals.registered_users),
      activeUsersToday: asNumber(totals.active_users_today),
      previousEvents: asNumber(totals.previous_events),
      previousUniqueUsers: asNumber(totals.previous_unique_users),
      eventsChangePercentage: asNullableNumber(
        totals.events_change_percentage,
      ),
      usersChangePercentage: asNullableNumber(
        totals.users_change_percentage,
      ),
    },
    features: asArray(source.features).map((entry) => {
      const metric = asRecord(entry);
      return {
        featureKey: asString(metric.feature_key),
        displayName: asString(metric.display_name, "Onbekende functie"),
        category: asString(metric.category, "Overig"),
        events: asNumber(metric.events),
        users: asNumber(metric.users),
        sharePercentage: asNumber(metric.share_percentage),
        lastUsedAt:
          typeof metric.last_used_at === "string" ? metric.last_used_at : null,
      };
    }),
    daily: asArray(source.daily).map((entry) => {
      const metric = asRecord(entry);
      return {
        day: asString(metric.day),
        events: asNumber(metric.events),
        users: asNumber(metric.users),
      };
    }),
    platforms: asArray(source.platforms).map((entry) => {
      const metric = asRecord(entry);
      return {
        platform: asString(metric.platform, "unknown"),
        events: asNumber(metric.events),
        users: asNumber(metric.users),
      };
    }),
    eventTypes: asArray(source.event_types).map((entry) => {
      const metric = asRecord(entry);
      return {
        eventName: asString(metric.event_name, "unknown"),
        events: asNumber(metric.events),
        users: asNumber(metric.users),
      };
    }),
  };
};

export async function loadProductAnalytics(days: number): Promise<DashboardData> {
  const identity = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_product_analytics", {
    p_days: days,
  });

  if (error) {
    throw new Error(`Dashboarddata kon niet worden geladen: ${error.message}`);
  }

  return { identity, analytics: parseAnalytics(data) };
}
