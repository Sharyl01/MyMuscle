import { MUSCLE_CFG, type LogEntry, type SetEntry } from "./constants";

export const uid = () => Math.random().toString(36).slice(2, 11);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const dateKey = (value: Date | number) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

export const inSameDay = (ts: number, target: number) => {
  const date = new Date(ts);
  const ref = new Date(target);
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth() &&
    date.getDate() === ref.getDate()
  );
};

export const inToday = (ts: number) => inSameDay(ts, Date.now());

export type TrainingExperienceBand = "beginner" | "intermediate" | "advanced" | "expert";
export type ThresholdProfileContext = {
  trainingAge?: number | null;
  experience?: string | null;
};

export type WeeklyLoadPercentOptions = {
  targetSessionsPerWeek?: number | null;
  restDayCount?: number | null;
  monotonyCap?: number | null;
  monotonyWeight?: number | null;
  restReliefPerDay?: number | null;
  maxRestReliefDays?: number | null;
};

// Evidence-based heuristic:
// - Proximity to failure (RIR) is a stronger hypertrophy driver than chasing absolute failure.
// - We map effort (0-5) to a hard-set multiplier and convert each set into "stimulus units".
// - Resulting daily totals are intentionally closer to hard-set accounting than raw reps accounting.
const EFFORT_SET_MULTIPLIER = [0.15, 0.28, 0.45, 0.62, 0.78, 1.0];
const HARD_SET_STIMULUS_UNIT = 2.7;

const SET_TARGETS_BY_LEVEL: Record<
  TrainingExperienceBand,
  { min: number; optimalLow: number; optimalHigh: number; specializationHigh: number }
> = {
  beginner: { min: 1, optimalLow: 4, optimalHigh: 8, specializationHigh: 12 },
  intermediate: { min: 4, optimalLow: 8, optimalHigh: 15, specializationHigh: 18 },
  advanced: { min: 4, optimalLow: 12, optimalHigh: 20, specializationHigh: 25 },
  expert: { min: 6, optimalLow: 14, optimalHigh: 24, specializationHigh: 28 },
};

const EXPERIENCE_SCALE_SOFTENING = 0.2;
const PERFECT_THRESHOLD_ACCESSIBILITY_FACTOR = 0.8;
const OVERLOAD_THRESHOLD_BUFFER_FACTOR = 1.1;
const MIN_OVERLOAD_TO_PERFECT_RATIO = 1.9;
const DEFAULT_TARGET_SESSIONS_PER_WEEK = 4;
const DEFAULT_WEEKLY_MONOTONY_CAP = 2;
const DEFAULT_WEEKLY_MONOTONY_WEIGHT = 0.5;
const DEFAULT_WEEKLY_REST_RELIEF_PER_DAY = 0.03;
const DEFAULT_WEEKLY_MAX_REST_RELIEF_DAYS = 3;

const normalizeTrainingAge = (years?: number | null) => {
  if (!Number.isFinite(years)) return undefined;
  return Math.max(0, Number(years));
};

export const resolveTrainingExperienceBand = (
  profile?: ThresholdProfileContext,
): TrainingExperienceBand => {
  const token = String(profile?.experience ?? "").trim().toLowerCase();
  if (token.includes("expert") || token.includes("elite") || token.includes("7+")) return "expert";
  if (token.includes("adv") || token.includes("ervaren")) return "advanced";
  if (token.includes("inter") || token.includes("gevorderd")) return "intermediate";
  if (token.includes("begin")) return "beginner";

  const years = normalizeTrainingAge(profile?.trainingAge);
  if (typeof years === "number") {
    if (years < 1) return "beginner";
    if (years <= 3) return "intermediate";
    if (years <= 6) return "advanced";
    return "expert";
  }
  return "intermediate";
};

export const weeklySetTargetForProfile = (profile?: ThresholdProfileContext) =>
  SET_TARGETS_BY_LEVEL[resolveTrainingExperienceBand(profile)];

export const thresholdScaleForProfile = (profile?: ThresholdProfileContext) => {
  const baseMid =
    (SET_TARGETS_BY_LEVEL.intermediate.optimalLow +
      SET_TARGETS_BY_LEVEL.intermediate.optimalHigh) /
    2;
  const target = weeklySetTargetForProfile(profile);
  const targetMid = (target.optimalLow + target.optimalHigh) / 2;
  const rawScale = targetMid / Math.max(baseMid, 1);
  const softened = 1 + (rawScale - 1) * EXPERIENCE_SCALE_SOFTENING;
  return Math.min(1.25, Math.max(0.75, softened));
};

const repQualityFactor = (reps: number) => {
  if (reps <= 0) return 0;
  if (reps < 5) return 0.82;
  if (reps <= 7) return 0.92;
  if (reps <= 20) return 1.0;
  if (reps <= 30) return 0.92;
  return 0.8;
};

export const effRepsOfSet = ({ reps, effort }: SetEntry) => {
  if (reps <= 0) return 0;
  const safeEffort = Number.isFinite(effort) ? Math.round(effort) : 0;
  const idx = Math.max(0, Math.min(EFFORT_SET_MULTIPLIER.length - 1, safeEffort));
  const effortFactor = EFFORT_SET_MULTIPLIER[idx] ?? 0;
  return HARD_SET_STIMULUS_UNIT * effortFactor * repQualityFactor(reps);
};

// Jeff-style muscle set accounting:
// one set can count toward multiple muscles; we do not normalize to a 100% split.
export const setCreditForMuscleWeight = (weight: number) => {
  const safe = Number.isFinite(weight) ? Math.max(0, weight) : 0;
  if (safe >= 0.35) return 1;
  if (safe >= 0.2) return 0.9;
  if (safe >= 0.12) return 0.8;
  if (safe >= 0.07) return 0.65;
  if (safe >= 0.04) return 0.45;
  if (safe >= 0.02) return 0.25;
  return 0;
};

export const sumStimulusForDate = (logs: LogEntry[], targetTs: number) => {
  const acc: Record<string, number> = {};
  for (const log of logs) {
    if (!inSameDay(log.ts, targetTs)) continue;
    const setEff = log.sets.reduce((sum, st) => sum + effRepsOfSet(st), 0);
    for (const [m, w] of Object.entries(log.weights)) {
      const credit = setCreditForMuscleWeight(w);
      if (credit <= 0) continue;
      acc[m] = (acc[m] || 0) + setEff * credit;
    }
  }
  return acc;
};

export const computeStimulusLoadPercent = (
  stimulus: Record<string, number>,
  profile?: ThresholdProfileContext,
) => {
  let totalStimulus = 0;
  let totalSafeThreshold = 0;

  for (const [muscle, rawValue] of Object.entries(stimulus ?? {})) {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) continue;
    const thresholds = thresholdsFor(muscle, profile);
    const safeThreshold = thresholds[4] ?? thresholds[thresholds.length - 1] ?? 1;
    totalStimulus += value;
    totalSafeThreshold += Math.max(1, safeThreshold);
  }

  if (totalStimulus <= 0 || totalSafeThreshold <= 0) return 0;
  return clamp((totalStimulus / totalSafeThreshold) * 100, 0, 200);
};

export const computeWeeklyLoadPercent = (
  dailyLoadPercents: number[],
  options: WeeklyLoadPercentOptions = {},
) => {
  const normalizedDailyLoads = (dailyLoadPercents ?? []).map((value) =>
    clamp(Number.isFinite(value) ? Number(value) : 0, 0, 200),
  );
  if (!normalizedDailyLoads.length) return 0;

  const targetSessionsBase =
    Number.isFinite(options.targetSessionsPerWeek) && Number(options.targetSessionsPerWeek) > 0
      ? Number(options.targetSessionsPerWeek)
      : DEFAULT_TARGET_SESSIONS_PER_WEEK;
  const targetSessions = clamp(targetSessionsBase, 1, 7);
  const totalLoad = normalizedDailyLoads.reduce((sum, value) => sum + value, 0);
  if (totalLoad <= 0) return 0;

  const weeklyMean = totalLoad / normalizedDailyLoads.length;
  const variance =
    normalizedDailyLoads.reduce((sum, value) => sum + (value - weeklyMean) ** 2, 0) /
    normalizedDailyLoads.length;
  const stdDev = Math.sqrt(variance);

  const monotonyCapBase =
    Number.isFinite(options.monotonyCap) && Number(options.monotonyCap) > 0
      ? Number(options.monotonyCap)
      : DEFAULT_WEEKLY_MONOTONY_CAP;
  const monotonyCap = Math.max(1, monotonyCapBase);
  const monotonyWeight =
    Number.isFinite(options.monotonyWeight) && Number(options.monotonyWeight) >= 0
      ? Number(options.monotonyWeight)
      : DEFAULT_WEEKLY_MONOTONY_WEIGHT;
  const rawMonotony = stdDev > 0 ? weeklyMean / stdDev : Number.POSITIVE_INFINITY;
  const monotony = Math.min(monotonyCap, rawMonotony);
  const monotonyPenalty = Math.max(0, monotony - 1);

  const restReliefPerDay =
    Number.isFinite(options.restReliefPerDay) && Number(options.restReliefPerDay) >= 0
      ? clamp(Number(options.restReliefPerDay), 0, 0.25)
      : DEFAULT_WEEKLY_REST_RELIEF_PER_DAY;
  const maxRestReliefDays =
    Number.isFinite(options.maxRestReliefDays) && Number(options.maxRestReliefDays) >= 0
      ? Number(options.maxRestReliefDays)
      : DEFAULT_WEEKLY_MAX_REST_RELIEF_DAYS;
  const rawRestDayCount =
    Number.isFinite(options.restDayCount) && Number(options.restDayCount) > 0
      ? Number(options.restDayCount)
      : 0;
  const restDayCount = Math.min(rawRestDayCount, maxRestReliefDays);
  const recoveryMultiplier = Math.max(0.7, 1 - restDayCount * restReliefPerDay);

  const baseWeeklyPercent = totalLoad / targetSessions;
  return clamp(
    baseWeeklyPercent * (1 + monotonyPenalty * monotonyWeight) * recoveryMultiplier,
    0,
    999,
  );
};

export const getCfg = (m: string) => MUSCLE_CFG[m] ?? { red: 18, overload: 24 };
export const thresholdsFor = (m: string, profile?: ThresholdProfileContext) => {
  const { red, overload } = getCfg(m);
  const scale = thresholdScaleForProfile(profile);
  const scaledRed = Math.max(1, red * scale * PERFECT_THRESHOLD_ACCESSIBILITY_FACTOR);
  const scaledOverload = Math.max(
    scaledRed + 1,
    overload * scale * OVERLOAD_THRESHOLD_BUFFER_FACTOR,
    scaledRed * MIN_OVERLOAD_TO_PERFECT_RATIO,
  );
  // 6-zone model:
  // 0 none, 1 very low, 2 low, 3 enough, 4 perfect, 5 overstim.
  return [0, 0.1 * scaledRed, 0.3 * scaledRed, 0.65 * scaledRed, scaledRed, scaledOverload];
};

export const levelFrom = (value: number, thr: number[]) => {
  let idx = 0;
  for (let i = 0; i < thr.length; i++) if (value >= thr[i]) idx = i;
  return idx;
};
