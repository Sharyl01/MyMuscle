"use client";

import { useState, type FormEvent } from "react";
import { exercises, validDemoSet, type MuscleGroup } from "./demo-data";
import h from "./hero.module.css";

export type PreviewSet = { reps: number; weight: number; effort: number };
export type PreviewWorkout = { muscle: MuscleGroup; exercise: string; sets: PreviewSet[] };

// Mirrors app/ExerciseModal: choose exercise → reps/weight/intensity → add sets → save.
// This preview is local; its saved sets feed the same load calculation as the app.
export function WorkoutPreview({ muscle, onSave, onClose }: {
  muscle: MuscleGroup;
  onSave: (workout: PreviewWorkout) => void;
  onClose: () => void;
}) {
  const [exercise, setExercise] = useState<string | null>(null);
  const [reps, setReps] = useState("8");
  const [weight, setWeight] = useState(muscle === "Chest" || muscle === "Quads" ? "80" : "20");
  const [effort, setEffort] = useState(2);
  const [sets, setSets] = useState<PreviewSet[]>([]);
  const [error, setError] = useState("");
  const bodyweight = exercise === "Pull-up";

  function choose(name: string) {
    setExercise(name); setSets([]); setError(""); setEffort(2);
  }
  function addSet(event: FormEvent) {
    event.preventDefault();
    if (!exercise) return;
    const kg = bodyweight ? 80 : Number(weight);
    if ((!bodyweight && !weight.trim()) || !validDemoSet(kg, Number(reps))) {
      setError("Enter 1–100 whole reps and a weight from 0–500 kg."); return;
    }
    setSets(previous => [...previous, { reps: Number(reps), weight: kg, effort }]);
    setError("");
  }

  return <section className={h.workoutPanel} aria-label={`${muscle} workout preview`}>
    <div className={h.panelHeader}>
      <div><span className={h.panelEyebrow}>MYMUSCLE / WORKOUT</span><h3>{muscle}</h3></div>
      <button type="button" onClick={onClose} className={h.closePanel} aria-label="Close exercise preview">×</button>
    </div>
    {!exercise ? <div className={h.exerciseList}>
      <p>Choose an exercise</p>
      {exercises[muscle].map((name, index) => <button key={name} type="button" onClick={() => choose(name)}><span className={h.exerciseNumber} aria-hidden="true">0{index + 1}</span><strong>{name}</strong><span aria-hidden="true">›</span></button>)}
      <span className={h.panelNote}>Two exercises. A first look at MyMuscle.</span>
    </div> : <>
      <button className={h.backToExercises} type="button" onClick={() => { setExercise(null); setSets([]); setError(""); }}>← Change exercise</button>
      <h4 className={h.exerciseTitle}>{exercise}</h4>
      <form className={h.setForm} onSubmit={addSet}>
        <div className={h.workoutInputs}>
          <label>Reps<input aria-label="Reps" type="number" inputMode="numeric" min="1" max="100" step="1" required value={reps} onChange={event => setReps(event.target.value)} /></label>
          {!bodyweight ? <label>Weight <span>kg</span><input aria-label="Weight in kilograms" type="number" inputMode="decimal" min="0" max="500" step="0.5" required value={weight} onChange={event => setWeight(event.target.value)} /></label> : <div className={h.bodyweightField}><span>Body weight</span><strong>80 <small>kg</small></strong><small>Example profile</small></div>}
        </div>
        <label className={h.effortLabel}>Intensity <output htmlFor="demo-effort">{effort} / 5</output><input id="demo-effort" aria-label="Intensity" type="range" min="0" max="5" step="1" value={effort} onChange={event => setEffort(Number(event.target.value))} /></label>
        <div className={h.effortScale}><span>Very light</span><span>Near failure</span></div>
        <button type="submit" className={h.addSet}><span aria-hidden="true">＋</span> Add set</button>
        {error && <p className={h.inputError} role="alert">{error}</p>}
      </form>
      <div className={h.setList} aria-label="Sets to save">
        <div className={h.setListHeading}><span>SETS</span><span>{sets.length} added</span></div>
        {sets.length === 0 ? <p className={h.emptySets}>Add your first set.</p> : sets.map((set, index) => <div className={h.setRow} key={index}><span>{index + 1}</span><strong>{set.reps} × {set.weight} kg</strong><small>@ {set.effort}</small><button type="button" aria-label={`Remove set ${index + 1}`} onClick={() => setSets(previous => previous.filter((_, i) => i !== index))}>×</button></div>)}
      </div>
      <button className={h.saveWorkout} type="button" disabled={!sets.length} onClick={() => onSave({ muscle, exercise, sets })}>Save workout <span aria-hidden="true">✓</span></button>
    </>}
  </section>;
}
