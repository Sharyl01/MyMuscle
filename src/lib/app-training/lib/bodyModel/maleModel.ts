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

export type BodyModelMuscleId = (typeof BODY_MODEL_MUSCLE_IDS)[number];

const BODY_MODEL_MUSCLE_SET = new Set<string>(BODY_MODEL_MUSCLE_IDS);

export const isBodyModelMuscle = (name: string): name is BodyModelMuscleId =>
  BODY_MODEL_MUSCLE_SET.has(name);

export const baseMuscleIdForModelMesh = (name: BodyModelMuscleId) =>
  name.replace(/_(l|r)$/u, "");

/**
 * Color keys are ordered from generic to specific. This lets a bilateral app
 * color (for example `upper_chest`) drive both 3D meshes while preserving a
 * side-specific override when one exists.
 */
export const colorKeysForModelMesh = (name: BodyModelMuscleId) => {
  const base = baseMuscleIdForModelMesh(name);
  return Array.from(new Set([base, `${base}_stroke`, name, `${name}_stroke`]));
};

export const bodyModelTypeForProfile = (profile?: {
  gender?: "Male" | "Female" | "Other" | "PreferNotToSay";
  sex?: "male" | "female" | "other";
}): "male" | "female" => {
  if (profile?.gender !== undefined) {
    return profile.gender === "Female" ? "female" : "male";
  }
  return profile?.sex === "female" ? "female" : "male";
};

// Backwards-compatible aliases for the initial male-only implementation.
export const MALE_MODEL_MUSCLE_IDS = BODY_MODEL_MUSCLE_IDS;
export type MaleModelMuscleId = BodyModelMuscleId;
export const isMaleModelMuscle = isBodyModelMuscle;
