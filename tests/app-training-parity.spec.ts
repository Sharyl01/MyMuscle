import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import assert from "node:assert/strict";
import manifest from "../src/lib/app-training/manifest.json";
import { appExerciseFor, exercises, loadsForWorkouts, workoutLog, loadForMesh, demoLoadFeedback } from "../src/components/marketing/demo-data";
import { sumStimulusForDate as appStimulus, thresholdsFor as appThresholds } from "../../Fitnessapp28-11-2025/lib/training/utils";
import { muscleLoadStepFromValue as appColor } from "../../Fitnessapp28-11-2025/lib/training/loadSpectrum";
import { EXERCISE_DB as appExercises } from "../../Fitnessapp28-11-2025/lib/training/constants";
import { BODY_MODEL_MUSCLE_IDS, colorKeysForModelMesh } from "../../Fitnessapp28-11-2025/lib/bodyModel/maleModel";

test("app engine snapshot matches its hashes and current app source byte for byte", () => {
  for (const [file, hash] of Object.entries(manifest)) {
    const shipped = readFileSync(path.join(process.cwd(), "src/lib/app-training", file));
    const currentApp = readFileSync(path.join(process.cwd(), "../Fitnessapp28-11-2025", file));
    expect(createHash("sha256").update(shipped).digest("hex")).toBe(hash);
    expect(shipped.equals(currentApp), file).toBe(true);
  }
});

test("every preview exercise matches app stimulus, thresholds, and mesh colors at all experience levels", () => {
  const today = new Date(2026, 8, 16, 12).getTime();
  for (const name of Object.values(exercises).flat()) {
    const exercise = appExerciseFor(name);
    expect(exercise).toEqual(appExercises.find(item => item.id === exercise.id));
    for (const experience of ["beginner", "intermediate", "advanced", "expert"] as const) {
      for (const effort of [0, 1, 2, 3, 4, 5]) {
        for (const count of [1, 4, 12, 30]) {
          const sets = Array.from({ length: count }, (_, index) => ({ reps: [3, 6, 8, 25, 40][index % 5], weight: 80, effort }));
          const logs = [workoutLog(name, sets, today), workoutLog("Bench Press", sets, today - 86400000)];
          const actual = loadsForWorkouts(logs, today);
          const expected = appStimulus(logs, today);
          assert.deepEqual(actual, expected);
          for (const mesh of BODY_MODEL_MUSCLE_IDS) {
            const key = colorKeysForModelMesh(mesh).filter(id => expected[id] !== undefined).at(-1);
            const rendered = loadForMesh(mesh, actual, { experience });
            if (!key) { assert.equal(rendered, null); continue; }
            const thresholds = appThresholds(key, { experience });
            const color = appColor(expected[key], thresholds[4], thresholds[5]);
            assert.deepEqual(rendered && { value: rendered.value, hex: rendered.hex, opacity: rendered.opacity, index: rendered.index },
              { value: expected[key], hex: color.hex, opacity: color.opacity, index: color.index }, `${name}, ${experience}, effort ${effort}, ${count} sets, ${mesh}`);
          }
        }
      }
    }
  }
});

test("four sets do not overload; intensity, compound muscles, and day boundaries follow the app", () => {
  const today = new Date(2026, 8, 16, 12).getTime();
  const sets = (effort: number, count = 4) => Array.from({ length: count }, () => ({ reps: 8, weight: 80, effort }));
  const light = loadsForWorkouts([workoutLog("Bench Press", sets(2), today)], today);
  const hard = loadsForWorkouts([workoutLog("Bench Press", sets(5), today)], today);
  expect(light.lower_chest).toBeCloseTo(4.86);
  expect(hard.lower_chest).toBeCloseTo(10.8);
  expect(light.triceps).toBeGreaterThan(0);
  expect(light.front_delt_l).toBeGreaterThan(0);
  expect(light.quads_l).toBeUndefined();
  expect(demoLoadFeedback("Chest", light, "intermediate").step).toBeLessThan(8);
  expect(demoLoadFeedback("Chest", hard, "intermediate").label).toBe("Perfect");
  expect(loadsForWorkouts([workoutLog("Bench Press", sets(5), today - 86400000)], today)).toEqual({});
  const overloaded = loadsForWorkouts([workoutLog("Bench Press", sets(5, 30), today)], today);
  expect(demoLoadFeedback("Chest", overloaded, "intermediate").label).toBe("Overloaded");
});
