import s from "./marketing.module.css";
import h from "./hero.module.css";

export function LaunchCountdown({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <div
      className={variant === "compact" ? h.releaseCountdown : s.countdown}
      role="note"
      aria-label="App release status"
    >
      <span className={s.countdownLabel}>
        MyMuscle is live
        <small>Available now on the App Store and Google Play.</small>
      </span>
    </div>
  );
}
