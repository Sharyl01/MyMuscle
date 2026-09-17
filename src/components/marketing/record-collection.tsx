"use client";

import { useState } from "react";
import { useVisualEntrance } from "./use-visual-entrance";
import v from "./product-visuals.module.css";

const records = [
  { lift: "Bench Press", weight: 80, reps: 1, bodyweight: 78, date: "2026-03-12", dateLabel: "12 Mar 2026" },
  { lift: "Squat", weight: 110, reps: 1, bodyweight: 78.5, date: "2026-03-18", dateLabel: "18 Mar 2026" },
  { lift: "Deadlift", weight: 140, reps: 1, bodyweight: 79, date: "2026-03-24", dateLabel: "24 Mar 2026" },
] as const;

export function RecordCollection() {
  const entrance = useVisualEntrance();
  const [selected, setSelected] = useState<number | null>(null);
  const record = selected === null ? null : records[selected];

  return <figure ref={entrance} data-revealed="pending" className={v.records} aria-label="Explore your personal records">
    <div className={v.recordStage}>
      {records.map((item, index) => <button className={v.recordButton} type="button" key={item.lift}
        aria-label={`${item.lift} PR details`} aria-expanded={selected === index} aria-controls="pr-details"
        onClick={() => setSelected(selected === index ? null : index)}>
        <span className={v.recordFace}>
          <svg viewBox="0 0 40 44" fill="none" aria-hidden="true"><path d="M11 5h18v12c0 7-4 11-9 11s-9-4-9-11V5ZM11 9H5v5c0 5 3 8 8 8M29 9h6v5c0 5-3 8-8 8M20 28v9M13 39h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <strong>{item.weight}<small>kg</small></strong>
          <span className={v.recordType}>1 REP MAX</span>
        </span>
        <span className={v.recordName}>{item.lift}</span>
        <span className={v.recordAction}>{selected === index ? "Close details −" : "View PR +"}</span>
      </button>)}
    </div>
    <div className={v.detailSpace}>
      <div id="pr-details" aria-live="polite" aria-atomic="true">
        {record && <section className={v.recordDetails} aria-label={`${record.lift} personal record`} key={record.lift}>
          <div className={v.detailHeading}><h3>{record.lift}</h3><span>PERSONAL RECORD</span></div>
          <dl>
            <div><dt>Date achieved</dt><dd><time dateTime={record.date}>{record.dateLabel}</time></dd></div>
            <div><dt>Weight</dt><dd>{record.weight} <small>kg</small></dd></div>
            <div><dt>Reps</dt><dd>{record.reps}</dd></div>
            <div><dt>Bodyweight</dt><dd>{record.bodyweight} <small>kg</small></dd></div>
          </dl>
          <p>1 rep max · {record.weight} kg × {record.reps} rep</p>
        </section>}
      </div>
      {!record && <p className={v.recordHint}>Every record has a story.<span>Tap a PR to see when and how you achieved it.</span></p>}
    </div>
    <figcaption className={v.visualCaption}>PR Log · Example records</figcaption>
  </figure>;
}
