"use client";

import { useEffect, useState } from "react";
import {
  emptyTimeRemaining,
  getTimeRemaining,
  LAUNCH_DISPLAY,
} from "@/lib/launch";
import s from "./marketing.module.css";
import h from "./hero.module.css";

export function LaunchCountdown({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [time, setTime] =
    useState<ReturnType<typeof getTimeRemaining>>(emptyTimeRemaining);
  useEffect(() => {
    const update = () => setTime(getTimeRemaining());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={variant === "compact" ? h.releaseCountdown : s.countdown}
      role="timer"
      aria-label={`Launch countdown. ${LAUNCH_DISPLAY}`}
    >
      <span className={s.countdownLabel}>
        {time ? variant === "compact" ? "THE RELEASE COUNTDOWN" : "The countdown is on" : "Launch countdown complete"}
        <small>{LAUNCH_DISPLAY}</small>
      </span>
      <div className={s.clock}>
        {(
          time ?? emptyTimeRemaining.map((unit) => ({ ...unit, value: "00" }))
        ).map((unit) => (
          <span key={unit.label}>
            <b>{unit.value}</b>
            <small>{unit.label.slice(0, 3)}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
