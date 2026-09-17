"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { demoLoadFeedback, loadsForWorkouts, workoutLog, type DemoProfile, type MuscleGroup } from "./demo-data";
import type { LogEntry } from "@/lib/app-training/lib/training/constants";
import { MuscleModel } from "./muscle-model";
import { WorkoutPreview, type PreviewWorkout } from "./workout-preview";
import h from "./hero.module.css";

export function InteractiveHero() {
  const [selected, setSelected] = useState<MuscleGroup | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const experience: DemoProfile = "intermediate";
  const [day, setDay] = useState(0);
  const loads = useMemo(() => loadsForWorkouts(logs, day), [logs, day]);
  const controls = useRef<HTMLDivElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<PreviewWorkout | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const feedback = demoLoadFeedback(selected, loads, experience);

  function select(group: MuscleGroup) {
    setSelected(group); setLastWorkout(null); setPanelKey(previous => previous + 1);
    if (window.matchMedia("(max-width: 800px)").matches) requestAnimationFrame(() => {
      const panel = controls.current;
      if (panel && panel.getBoundingClientRect().bottom > window.innerHeight) panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" });
    });
  }
  function save(workout: PreviewWorkout) {
    const ts = Date.now();
    setDay(ts);
    setLogs(previous => [...previous, workoutLog(workout.exercise, workout.sets, ts)]);
    setLastWorkout(workout);
  }
  function reset() {
    setSelected(null); setLogs([]); setLastWorkout(null); setResetKey(previous => previous + 1);
  }

  return <section id="experience" className={h.hero} aria-labelledby="hero-title">
    <div className={h.editorial} data-active={Boolean(selected)}>
      <h1 id="hero-title">See your<br /><span>training.</span></h1>
      <p className={h.heroLead}><span>Every muscle.</span>{" "}<span>Every workout.</span>{" "}<span>Visualized.</span></p>
      <div className={h.context} data-active={Boolean(selected)} data-load-step={feedback.step} style={{ "--feedback-color": feedback.color } as CSSProperties} aria-live="polite" aria-atomic="true">
        {selected && <div key={`${selected}-${feedback.step}`} className={h.contextTitle}>
          <h2>{feedback.step ? feedback.headline : `${selected} selected.`}</h2>
          <p>{feedback.message}</p>
          <div className={h.loadSteps} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} data-filled={i < feedback.step} />)}</div>
          {feedback.muscle && <small className={h.loadDetail}>{feedback.muscle.replace(/_(l|r)$/, "").replaceAll("_", " ")} · Today’s load</small>}
        </div>}
      </div>
    </div>
    <div className={h.experience} aria-label="Interactive MyMuscle experience">
      <MuscleModel selected={selected} loads={loads} experience={experience} resetKey={resetKey} onSelect={select} />
      <div className={h.controls} ref={controls}>
        {lastWorkout ? <div className={h.savedWorkout}>
          <span className={h.savedIcon} aria-hidden="true">✓</span><p className={h.panelEyebrow}>WORKOUT SAVED</p><h3 style={{ color: feedback.color }}>{lastWorkout.muscle} · {feedback.label}</h3>
          <p className={h.mobileFeedback}>{feedback.headline} {feedback.message}</p>
          <div role="status"><strong>{lastWorkout.exercise}</strong><p>{lastWorkout.sets.length} {lastWorkout.sets.length === 1 ? "set" : "sets"} logged</p>{lastWorkout.sets.map((set, i) => <span key={i}>{set.reps} × {set.weight} kg</span>)}</div>
          <button type="button" className={h.viewModel} onClick={() => document.querySelector("[data-model-status]")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" })}>See your muscle map <span aria-hidden="true">↑</span></button>
          <button type="button" className={h.saveWorkout} onClick={() => select(lastWorkout.muscle)}>Log another workout <span aria-hidden="true">＋</span></button>
          <button type="button" className={h.backToExercises} onClick={() => { setSelected(null); setLastWorkout(null); }}>Explore another muscle →</button>
        </div> : selected ? <WorkoutPreview key={`${selected}-${panelKey}`} muscle={selected} onSave={save} onClose={() => setSelected(null)} /> : <div className={h.startPreview}>
          <p className={h.panelEyebrow}>TRY IT FOR YOURSELF</p><h3>One muscle.<br />Your first set.</h3><p>Tap a muscle to explore its exercises.</p>
          <div className={h.quickMuscles}>{(["Chest", "Back", "Quads"] as MuscleGroup[]).map(group => <button key={group} type="button" onClick={() => select(group)}>{group === "Quads" ? "Legs" : group}<span aria-hidden="true">↗</span></button>)}</div>
        </div>}
        <div className={h.demoTools}><button type="button" onClick={reset}>Reset demo</button></div>
      </div>
    </div>
  </section>;
}
