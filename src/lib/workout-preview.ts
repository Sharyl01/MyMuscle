import "server-only";
import { cache } from "react";

export const SHARE_ORIGIN = "https://mymuscle.app";
export const validShareId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
type SetTarget = { reps: number; repMax: number; effort: number; restSeconds: number; durationSeconds?: number };
export type WorkoutPreview = {
  name: string; split: string; goal: string; emphasis: string[]; frequency: number;
  previewWorkouts: { day: number; name: string; exercises: { name: string; sets: SetTarget[] }[] }[];
  lockedDays: number[]; restDays: number[]; visibleSets: number; hiddenSets: number;
};
export const muscleLabels: Record<string, string> = { chest: "Chest", back: "Back", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", quads: "Quadriceps", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves", core: "Core" };
export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Deliberately anonymous: no cookies, user session or service-role key. Even
// page source, RSC payloads and social crawlers can only receive this public DTO.
export const getWorkoutPreview = cache(async (id: string): Promise<WorkoutPreview | null> => {
  if (!validShareId(id)) return null;
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!endpoint || !key) throw new Error("Workout previews are not configured");
  const response = await fetch(`${endpoint}/rest/v1/rpc/workout_public_preview_v1`, {
    method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ share_id: id }), cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Workout preview temporarily unavailable");
  const data = await response.json();
  if (data === null) return null;
  if (data.version !== 1 || !Array.isArray(data.previewWorkouts) || !Number.isInteger(data.visibleSets) || !Number.isInteger(data.hiddenSets)
      || data.hiddenSets < 0 || (data.visibleSets > 0 && data.visibleSets > Math.max(1, Math.floor((data.visibleSets + data.hiddenSets) / 3)))) throw new Error("Invalid preview");
  let visible = 0;
  const previewWorkouts = data.previewWorkouts.map((workout: WorkoutPreview["previewWorkouts"][number]) => ({
    day: workout.day, name: workout.name, exercises: workout.exercises.map(exercise => ({
      name: exercise.name, sets: exercise.sets.map(set => {
        visible++;
        return { reps: set.reps, repMax: set.repMax, effort: set.effort, restSeconds: set.restSeconds, ...(set.durationSeconds ? { durationSeconds: set.durationSeconds } : {}) };
      }),
    })),
  }));
  if (visible !== data.visibleSets) throw new Error("Invalid preview budget");
  // Whitelist fields again. Never forward the raw RPC response into React.
  return { name: data.name, split: data.split, goal: data.goal, emphasis: data.emphasis.filter((m: string) => m in muscleLabels), frequency: data.frequency,
    previewWorkouts, lockedDays: data.lockedDays, restDays: data.restDays, visibleSets: data.visibleSets, hiddenSets: data.hiddenSets };
});
