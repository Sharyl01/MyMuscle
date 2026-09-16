import { EXERCISE_DB, type LogEntry, type SetEntry } from "@/lib/app-training/lib/training/constants";
import { sumStimulusForDate, thresholdsFor, type ThresholdProfileContext } from "@/lib/app-training/lib/training/utils";
import { muscleLoadStepFromValue, muscleLoadPercentFromValue } from "@/lib/app-training/lib/training/loadSpectrum";
import { colorKeysForModelMesh, isBodyModelMuscle } from "@/lib/app-training/lib/bodyModel/maleModel";

export const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Abs",
  "Obliques",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
] as const;
export type MuscleGroup = (typeof muscleGroups)[number];
export type TrainingLoad = Record<string, number>;
export type DemoProfile = "beginner" | "intermediate" | "advanced" | "expert";

// These names are the original mobile app GLB mesh IDs. Geometry is untouched.
export function groupForMesh(name: string): MuscleGroup | null {
  if (/chest/.test(name)) return "Chest";
  if (/lat_|traps|rhomboid|lower_back/.test(name)) return "Back";
  if (/delt/.test(name)) return "Shoulders";
  if (/biceps/.test(name)) return "Biceps";
  if (/triceps/.test(name)) return "Triceps";
  if (/forearm/.test(name)) return "Forearms";
  if (name === "abs") return "Abs";
  if (/obliques/.test(name)) return "Obliques";
  if (/quads/.test(name)) return "Quads";
  if (/hamstrings/.test(name)) return "Hamstrings";
  if (/glutes/.test(name)) return "Glutes";
  if (/calves/.test(name)) return "Calves";
  return null;
}

export const exercises: Record<MuscleGroup, readonly [string, string]> = {
  Chest: ["Bench Press", "Incline Bench Press"],
  Back: ["Pull-up", "Lat Pulldown"],
  Shoulders: ["Shoulder Press", "Lateral Raise"],
  Biceps: ["Barbell Curl", "Dumbbell Curl"],
  Triceps: ["Triceps Pushdown", "Overhead Extension"],
  Forearms: ["Wrist Curl", "Reverse Wrist Curl"],
  Abs: ["Cable Crunch", "Standing Cable Crunch"],
  Obliques: ["Cable Woodchop", "Low Cable Woodchop"],
  Quads: ["Squat", "Leg Press"],
  Hamstrings: ["Leg Curl", "Romanian Deadlift"],
  Glutes: ["Hip Thrust", "Glute Bridge"],
  Calves: ["Standing Calf Raise", "Seated Calf Raise"],
};

// Website labels resolve to real app exercise IDs; all weights come from EXERCISE_DB.
const exerciseIds: Record<string, string> = {
  "Bench Press": "bench-press", "Incline Bench Press": "incline-barbell-bench-press",
  "Pull-up": "pull-up", "Lat Pulldown": "lat-pulldown",
  "Shoulder Press": "seated-barbell-shoulder-press", "Lateral Raise": "lateral-raise",
  "Barbell Curl": "bb-curl", "Dumbbell Curl": "db-curl",
  "Triceps Pushdown": "triceps-pushdown", "Overhead Extension": "overhead-cable-triceps-extension",
  "Wrist Curl": "cable-wrist-curl", "Reverse Wrist Curl": "palms-down-barbell-wrist-curl",
  "Cable Crunch": "cable-crunch", "Standing Cable Crunch": "standing-cable-crunch",
  "Cable Woodchop": "cable-woodchopper-high", "Low Cable Woodchop": "cable-woodchopper-low",
  "Squat": "squat", "Leg Press": "leg-press",
  "Leg Curl": "seated-leg-curl-machine", "Romanian Deadlift": "romanian-deadlift",
  "Hip Thrust": "hip-thrust", "Glute Bridge": "glute-bridge",
  "Standing Calf Raise": "calf-raise", "Seated Calf Raise": "seated-calf-raise",
};

export function appExerciseFor(name: string) {
  const exercise = EXERCISE_DB.find(item => item.id === exerciseIds[name]);
  if (!exercise) throw new Error(`No app exercise mapped for ${name}`);
  return exercise;
}

export function workoutLog(exerciseName: string, sets: SetEntry[], ts: number): LogEntry {
  const exercise = appExerciseFor(exerciseName);
  return { id: `${ts}-${exercise.id}`, ts, exerciseId: exercise.id, exercise: exercise.name, sets, weights: exercise.weights };
}

// The exact app calculation: intensity + rep quality + muscle credit, for this day.
export const loadsForWorkouts = (logs: LogEntry[], ts: number) => sumStimulusForDate(logs, ts);

export function loadForMuscle(muscle: string, loads: TrainingLoad, profile: ThresholdProfileContext) {
  const value = loads[muscle] ?? 0;
  const thresholds = thresholdsFor(muscle, profile);
  const result = muscleLoadStepFromValue(value, thresholds[4], thresholds[5]);
  return { ...result, value, muscle, percent: muscleLoadPercentFromValue(value, thresholds[4], thresholds[5]) };
}

export function loadForMesh(mesh: string, loads: TrainingLoad, profile: ThresholdProfileContext) {
  if (!isBodyModelMuscle(mesh)) return null;
  // App precedence is base, base stroke, side, side stroke. Keep the original
  // stimulus key for its threshold (e.g. upper_chest drives both chest meshes).
  const muscle = colorKeysForModelMesh(mesh).filter(key => loads[key] !== undefined).at(-1);
  return muscle ? loadForMuscle(muscle, loads, profile) : null;
}

const statusCopy = [
  ["Very light", "A strong start.", "Your first effort made its mark. There is room to build."],
  ["Light", "Finding your rhythm.", "The stimulus is growing. Keep your next sets controlled."],
  ["Light–moderate", "Every set adds up.", "Your muscle map is starting to tell the story."],
  ["Moderate", "A solid foundation.", "A meaningful start, with room for more quality work."],
  ["Building", "Momentum is building.", "Your effort is adding up. Make every next set count."],
  ["Good", "Quality work, logged.", "You are building a productive training stimulus."],
  ["Strong", "A strong session.", "You are closing in on the target zone for this muscle."],
  ["Perfect", "Right in the sweet spot.", "A well-earned finish. Let this muscle recover while you focus elsewhere."],
  ["Above target", "You have passed the target.", "Extra sets are adding fatigue. Consider moving to another muscle."],
  ["High", "A lot of work. Time to pause.", "This muscle has taken on a high load. Give recovery some space."],
  ["Very high", "Make room for recovery.", "The load is well above target. Focus your next work elsewhere."],
  ["Overloaded", "Time to recover.", "The work is done. Give this muscle a break and explore another."],
] as const;

export function demoLoadFeedback(group: MuscleGroup | null, loads: TrainingLoad, experience: DemoProfile) {
  const parts = Object.keys(loads).filter(muscle => groupForMesh(muscle) === group && loads[muscle] > 0);
  const highest = parts.map(muscle => loadForMuscle(muscle, loads, { experience })).sort((a, b) => b.percent - a.percent)[0];
  if (!highest) return { color: "#b8b5ac", label: "Selected", headline: "", message: "Choose an exercise. See your training take shape.", step: 0, percent: 0, muscle: "" };
  const [label, headline, message] = statusCopy[highest.index];
  // Lift only text brightness for readability; the model uses the original app hex.
  const color = highest.index >= 8 ? "#ee9690" : highest.hex;
  return { color, label, headline, message, step: highest.index + 1, percent: highest.percent, muscle: highest.muscle };
}

export function validDemoSet(weight: number, reps: number) {
  return (
    Number.isFinite(weight) &&
    weight >= 0 &&
    weight <= 500 &&
    Number.isInteger(reps) &&
    reps >= 1 &&
    reps <= 100
  );
}
