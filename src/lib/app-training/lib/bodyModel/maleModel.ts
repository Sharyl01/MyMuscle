export const BODY_MODEL_MUSCLE_IDS = [
  "abs",
  "biceps_l",
  "biceps_r",
  "calves_l",
  "calves_r",
  "forearm_l",
  "forearm_r",
  "front_delt_l",
  "front_delt_r",
  "glutes_l",
  "glutes_r",
  "hamstrings_l",
  "hamstrings_r",
  "lat_l",
  "lat_r",
  "lower_back_l",
  "lower_back_r",
  "lower_chest_l",
  "lower_chest_r",
  "lower_traps_l",
  "lower_traps_r",
  "obliques_l",
  "obliques_r",
  "quads_l",
  "quads_r",
  "rear_delt_l",
  "rear_delt_r",
  "rhomboid_l",
  "rhomboid_r",
  "side_delt_l",
  "side_delt_r",
  "traps_back_l",
  "traps_back_r",
  "traps_front",
  "triceps_l",
  "triceps_r",
  "upper_chest_l",
  "upper_chest_r",
] as const;

// The shipped GLBs still use rhomboid_* for the superficial scapular meshes.
// Translate asset names at the model boundary; exercise rhomboid loads stay distinct.
export const muscleIdForModelMesh = (name: string): string =>
  name.replace(/^rhomboid(?=_[lr]$)/u, "infraspinatus");

export type BodyModelMuscleId = (typeof BODY_MODEL_MUSCLE_IDS)[number] | "infraspinatus_l" | "infraspinatus_r";

const BODY_MODEL_MUSCLE_SET = new Set<string>([...BODY_MODEL_MUSCLE_IDS, "infraspinatus_l", "infraspinatus_r"]);

export const isBodyModelMuscle = (name: string): name is BodyModelMuscleId =>
  BODY_MODEL_MUSCLE_SET.has(name);

export function modelSelectionMembers(bodyType: "male" | "female", selected: string | null, members: string[], differentParts: boolean): string[] {
  const targets = differentParts && selected ? [selected] : members;
  if (bodyType === "male") return targets;
  return [...new Set(targets.flatMap(id => {
    const base = id.replace(/_stroke$/u, "").replace(/_[lr]$/u, "");
    const pair = [`${base}_l`, `${base}_r`].filter(isBodyModelMuscle);
    return pair.length === 2 ? pair : [id];
  }))];
}

export const baseMuscleIdForModelMesh = (name: BodyModelMuscleId) =>
  muscleIdForModelMesh(name).replace(/_(l|r)$/u, "");

/**
 * Color keys are ordered from generic to specific. This lets a bilateral app
 * color (for example `upper_chest`) drive both 3D meshes while preserving a
 * side-specific override when one exists.
 */
export const colorKeysForModelMesh = (name: BodyModelMuscleId) => {
  name = muscleIdForModelMesh(name) as BodyModelMuscleId;
  const base = baseMuscleIdForModelMesh(name);
  return Array.from(new Set([base, `${base}_stroke`, name, `${name}_stroke`]));
};

export const bodyModelTypeForProfile = (profile?: {
  gender?: "Male" | "Female" | "Other" | "PreferNotToSay";
  sex?: "male" | "female" | "other";
}, preference?: "auto" | "male" | "female"): "male" | "female" => {
  if (preference === "male" || preference === "female") return preference;
  if (profile?.gender !== undefined) {
    return profile.gender === "Female" ? "female" : "male";
  }
  return profile?.sex === "female" ? "female" : "male";
};

// Backwards-compatible aliases for the initial male-only implementation.
export const MALE_MODEL_MUSCLE_IDS = BODY_MODEL_MUSCLE_IDS;
export type MaleModelMuscleId = BodyModelMuscleId;
export const isMaleModelMuscle = isBodyModelMuscle;
