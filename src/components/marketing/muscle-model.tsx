"use client";

import { useEffect, useRef, useState } from "react";
import { muscleGroups, type DemoProfile, type MuscleGroup, type TrainingLoad } from "./demo-data";
import type { createModelScene } from "./model-scene";
import s from "./hero.module.css";

type Props = {
  selected: MuscleGroup | null;
  loads: TrainingLoad;
  experience: DemoProfile;
  resetKey: number;
  onSelect: (group: MuscleGroup) => void;
};

export function MuscleModel(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createModelScene> | null>(null);
  const latest = useRef(props);
  const [status, setStatus] = useState("loading");
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    latest.current = props;
    controller.current?.update(props);
  }, [props]);

  useEffect(() => {
    let cancelled = false;
    const container = host.current!;
    void import("./model-scene")
      .then(({ createModelScene }) => {
        if (cancelled) return;
        try {
          controller.current = createModelScene(container, {
            select: (group) => latest.current.onSelect(group),
            interact: () => setInteracted(true),
            ready: () => setStatus("ready"),
            fail: () => {
              setStatus("fallback");
              controller.current?.dispose();
              controller.current = null;
            },
          });
          controller.current.update(latest.current);
        } catch {
          setStatus("fallback");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  return (
    <div className={s.modelStage} data-model-status={status}>
      <div className={s.modelGround} aria-hidden="true" />
      {status !== "ready" && <div className={s.neutralLoading} data-neutral-loading aria-hidden="true"><span /></div>}
      <div
        ref={host}
        className={s.modelCanvas}
        data-ready={status === "ready"}
        role="group"
        tabIndex={0}
        aria-label="Interactive muscle model. Drag to rotate. Use Up and Down to select muscles, Left and Right to rotate."
        onKeyDown={event => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            controller.current?.rotate(event.key === "ArrowLeft" ? -Math.PI / 4 : Math.PI / 4);
          } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const current = props.selected ? muscleGroups.indexOf(props.selected) : -1;
            const index = event.key === "Home" ? 0 : event.key === "End" ? muscleGroups.length - 1
              : (current + (event.key === "ArrowUp" ? -1 : 1) + muscleGroups.length) % muscleGroups.length;
            props.onSelect(muscleGroups[index]);
          }
        }}
      />
      <div className={s.modelCaption}>
        {status === "loading" ? (
          <span role="status">Preparing your muscle map…</span>
        ) : status === "fallback" ? (
          <span role="status">
            3D view unavailable. Try the workout preview.
          </span>
        ) : !interacted && !props.selected ? (
          <span>↔ Drag to explore. Tap a muscle.</span>
        ) : (
          <span>
            Your training, from every angle.
          </span>
        )}
      </div>
      {status === "ready" && (
        <div className={s.rotationControls}>
          <button
            type="button"
            aria-label="Rotate model left"
            onClick={() => controller.current?.rotate(-Math.PI / 4)}
          >
            ↶
          </button>
          <span aria-hidden="true">360°</span>
          <button
            type="button"
            aria-label="Rotate model right"
            onClick={() => controller.current?.rotate(Math.PI / 4)}
          >
            ↷
          </button>
        </div>
      )}
      <div className={s.modelLegend}>
        <span>
          <i style={{ background: "#b8b5ac" }} />
          Untrained
        </span>
        <span>
          <i style={{ background: "#e8cc75" }} />
          Trained
        </span>
        <span>
          <i style={{ background: "#8fcba6" }} />
          Building
        </span>
        <span>
          <i style={{ background: "#7eb9ed" }} />
          High load
        </span>
      </div>
    </div>
  );
}
