export const LAUNCH_AT_UTC_ISO = "2026-05-15T19:00:00.000Z";
export const LAUNCH_AT_UTC_MS = Date.parse(LAUNCH_AT_UTC_ISO);
export const LAUNCH_DISPLAY = "15 May 2026, 19:00 UTC";

export type TimeUnit = {
  label: string;
  value: string;
};

export const emptyTimeRemaining: TimeUnit[] = [
  { label: "Days", value: "--" },
  { label: "Hours", value: "--" },
  { label: "Minutes", value: "--" },
  { label: "Seconds", value: "--" },
];

export function getTimeRemaining(nowMs = Date.now()): TimeUnit[] | null {
  const difference = LAUNCH_AT_UTC_MS - nowMs;

  if (difference <= 0) {
    return null;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;
  const second = 1000;

  return [
    {
      label: "Days",
      value: String(Math.floor(difference / day)).padStart(2, "0"),
    },
    {
      label: "Hours",
      value: String(Math.floor((difference % day) / hour)).padStart(2, "0"),
    },
    {
      label: "Minutes",
      value: String(Math.floor((difference % hour) / minute)).padStart(2, "0"),
    },
    {
      label: "Seconds",
      value: String(Math.floor((difference % minute) / second)).padStart(2, "0"),
    },
  ];
}
