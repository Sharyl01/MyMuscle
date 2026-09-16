import { MUSCLE_STATUS_GREENS } from "../../constants/muscleStatusColors";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const MUSCLE_LOAD_SPECTRUM = [
  // Satin progression. The semantic order stays unchanged:
  // champagne and gold for low load, cool jade/emerald into blue for the target zone,
  // then restrained ruby and oxblood tones above target.
  { hex: "#D6C59D", opacity: 0.76 },
  { hex: "#CBB383", opacity: 0.82 },
  { hex: "#BE9B5C", opacity: 0.88 },
  { hex: "#AA8240", opacity: 0.93 },
  { hex: MUSCLE_STATUS_GREENS.building, opacity: 0.95 },
  { hex: MUSCLE_STATUS_GREENS.ready, opacity: 0.97 },
  { hex: MUSCLE_STATUS_GREENS.strong, opacity: 0.99 },
  { hex: "#2AA9E6", opacity: 1 },
  { hex: "#946A72", opacity: 0.97 },
  { hex: "#895155", opacity: 0.99 },
  { hex: "#713940", opacity: 1 },
  { hex: "#4D222A", opacity: 1 },
] as const;

export const MUSCLE_LOAD_LABELS = [
  "Extreem laag",
  "Zeer laag",
  "Licht",
  "Licht-matig",
  "Opbouwend",
  "Goed",
  "Sterk",
  "Perfect",
  "Boven doel",
  "Hoog",
  "Zeer hoog",
  "Overbelasting",
] as const;

export type MuscleLoadSpectrumStep = (typeof MUSCLE_LOAD_SPECTRUM)[number] & { index: number };

const STEP_COUNT = MUSCLE_LOAD_SPECTRUM.length;
export const PERFECT_MUSCLE_LOAD_STEP_INDEX = 7;
const PERFECT_BOUNDARY_PERCENT =
  ((PERFECT_MUSCLE_LOAD_STEP_INDEX + 1) / STEP_COUNT) * 100;
const PERCENT_EPSILON = 1e-6;
const PERFECT_ENTRY_RATIO = 0.88;

export const muscleLoadStepIndexFromPercent = (percent: number) => {
  const clamped = clamp(percent, 0, 100);
  if (clamped >= 100) return STEP_COUNT - 1;
  const rawIndex = Math.floor((clamped / 100) * STEP_COUNT);
  return clamp(rawIndex, 0, STEP_COUNT - 1);
};

export const muscleLoadStepFromPercent = (percent: number): MuscleLoadSpectrumStep => {
  const index = muscleLoadStepIndexFromPercent(percent);
  return { ...MUSCLE_LOAD_SPECTRUM[index], index };
};

export const muscleLoadPercentFromValue = (
  value: number,
  safeThreshold: number,
  overloadThreshold: number,
) => {
  const load = Number.isFinite(value) ? Math.max(0, value) : 0;
  const safe = Number.isFinite(safeThreshold) && safeThreshold > 0 ? safeThreshold : 1;
  const overload =
    Number.isFinite(overloadThreshold) && overloadThreshold > safe
      ? overloadThreshold
      : safe + Math.max(safe * 0.35, 1);
  const perfectEntry = Math.min(overload, Math.max(1, safe * PERFECT_ENTRY_RATIO));

  if (load <= perfectEntry) {
    const underloadRatio = clamp(load / perfectEntry, 0, 1);
    return underloadRatio * (PERFECT_BOUNDARY_PERCENT - PERCENT_EPSILON);
  }

  if (load <= overload) {
    return PERFECT_BOUNDARY_PERCENT - PERCENT_EPSILON;
  }

  const overloadRange = Math.max(overload - safe, safe * 0.35, 1);
  const overloadRatio = clamp((load - overload) / overloadRange, 0, 1);
  return PERFECT_BOUNDARY_PERCENT + overloadRatio * (100 - PERFECT_BOUNDARY_PERCENT);
};

export const muscleLoadStepFromValue = (
  value: number,
  safeThreshold: number,
  overloadThreshold: number,
): MuscleLoadSpectrumStep =>
  muscleLoadStepFromPercent(muscleLoadPercentFromValue(value, safeThreshold, overloadThreshold));
