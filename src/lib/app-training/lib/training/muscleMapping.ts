import { EXERCISE_DB, type LogEntry } from "./constants";

// Repair only the two known shipped snapshots. Custom mappings and historical
// measurements remain intact; this also handles a pending offline legacy log.
const legacyMappings: Record<string, Record<string, number>> = {
  ohp: { front_delt_l: .3, front_delt_r: .3, side_delt_l: .15, side_delt_r: .15, traps_front: .1 },
  "hip-adduction-machine": { quads_l: .35, quads_r: .35, hamstrings_l: .12, hamstrings_r: .12, glutes_l: .03, glutes_r: .03 },
};
const corrected = new Map(EXERCISE_DB.map(exercise => [exercise.id, exercise.weights]));
export function normalizeKnownMuscleMapping(log: LogEntry): LogEntry {
  const legacy = legacyMappings[log.exerciseId];
  if (!legacy || Object.keys(log.weights ?? {}).length !== Object.keys(legacy).length ||
    !Object.entries(legacy).every(([id, value]) => log.weights[id] === value)) return log;
  return { ...log, weights: { ...corrected.get(log.exerciseId)! } };
}
