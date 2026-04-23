"use client";

import { useEffect, useState } from "react";
import {
  LAUNCH_DISPLAY,
  emptyTimeRemaining,
  getTimeRemaining,
  type TimeUnit,
} from "@/lib/launch";

export function CountdownTimer() {
  const [timeRemaining, setTimeRemaining] =
    useState<TimeUnit[]>(emptyTimeRemaining);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const nextTimeRemaining = getTimeRemaining();
      setIsReady(true);

      if (!nextTimeRemaining) {
        setHasLaunched(true);
        setTimeRemaining(emptyTimeRemaining);
        return;
      }

      setHasLaunched(false);
      setTimeRemaining(nextTimeRemaining);
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (hasLaunched) {
    return (
      <div className="surface-card glow-border rounded-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
          Official launch
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Now Live
            </p>
            <p className="mt-2 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              MyMuscle launched on {LAUNCH_DISPLAY}.
            </p>
          </div>
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-100">
            Download available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="surface-card glow-border rounded-lg p-5 sm:p-6"
      aria-live="polite"
      aria-label={`MyMuscle launch countdown for ${LAUNCH_DISPLAY}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">
            Official launch
          </p>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            {LAUNCH_DISPLAY}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
          {isReady ? "Live countdown" : "Syncing UTC"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {timeRemaining.map((unit) => (
          <div
            key={unit.label}
            className="min-w-0 overflow-hidden rounded-lg border border-white/8 bg-white/[0.035] px-2.5 py-4 text-center sm:px-3 sm:py-5"
          >
            <p className="font-display text-3xl font-semibold text-white sm:text-[2rem] md:text-4xl">
              {unit.value}
            </p>
            <p className="mt-2 truncate text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[0.68rem] sm:tracking-[0.18em]">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
