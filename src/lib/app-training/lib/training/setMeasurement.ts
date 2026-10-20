import type { SetEntry } from "./constants";

type MeasuredExercise = string | { id?: string; logMode?: string } | null | undefined;
export const isTimedExercise = (exercise: MeasuredExercise) => {
  const id = typeof exercise === "string" ? exercise : exercise?.id;
  return (typeof exercise === "object" && exercise?.logMode === "timed") || id === "plank" || id === "side-plank";
};
export const isTimedSet = (set: Pick<SetEntry, "durationSeconds"> | null | undefined) =>
  typeof set?.durationSeconds === "number" && Number.isInteger(set.durationSeconds) &&
  set.durationSeconds > 0 && set.durationSeconds <= 86400;
export const isValidTrainingSet = (set: Pick<SetEntry, "weight" | "reps" | "durationSeconds"> | null | undefined) =>
  Boolean(set && Number.isFinite(set.weight) && set.weight >= 0 && set.weight <= 2000 &&
    (set.durationSeconds !== undefined
      ? isTimedSet(set) && set.reps === 0 && set.weight === 0
      : Number.isInteger(set.reps) && set.reps > 0 && set.reps <= 1000));
export const setQuantity = (set: SetEntry) => isTimedSet(set) ? set.durationSeconds! : set.reps;
export const formatSetMeasurement = (set: SetEntry, exercise?: MeasuredExercise) =>
  isTimedSet(set) ? `${set.durationSeconds} s` : isTimedExercise(exercise)
    ? `${set.reps} (eenheid onbekend)` : `${set.reps} reps`;
export const createMeasuredSet = (quantity: number, effort: number, exercise: MeasuredExercise, weight = 0): SetEntry =>
  isTimedExercise(exercise) ? { reps: 0, durationSeconds: quantity, weight: 0, effort } : { reps: quantity, weight, effort };
