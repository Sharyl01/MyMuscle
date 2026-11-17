import { APP_STORE_URL, GOOGLE_PLAY_URL } from "./app-links";

// Both listings are verified live. Explicit overrides still fail closed.
export function appDownloadDestination(userAgent: string) {
  const ios = /iPhone|iPad|iPod|Macintosh.*Mobile/i.test(userAgent);
  const android = /Android/i.test(userAgent);
  const configured = ios ? process.env.MYMUSCLE_APP_STORE_URL || APP_STORE_URL : android ? process.env.MYMUSCLE_GOOGLE_PLAY_URL || GOOGLE_PLAY_URL : undefined;
  try {
    if (configured) {
      const url = new URL(configured);
      if (url.protocol === "https:" && !url.username && !url.password && !url.port && (
        (ios && url.hostname === "apps.apple.com" && url.pathname.endsWith("/id6815727446")) ||
        (android && url.hostname === "play.google.com" && url.pathname === "/store/apps/details" && url.searchParams.get("id") === "com.apphletes.mymuscle")
      )) return url.href;
    }
  } catch { /* fail closed to the real landing page */ }
  return "https://mymuscle.app/#waitlist";
}
// Public Play App Signing certificate, verified against generated APKs for
// released version 15 and version 18 through Google Play's read-only API.
export const ANDROID_PLAY_SIGNING_CERTIFICATE = "7F:A5:11:E4:4E:42:47:02:4F:36:4B:E0:4A:F9:FD:74:05:01:AC:DC:E2:35:5A:E8:87:AD:E1:DB:EF:DE:13:7D";
export function androidFingerprints() {
  return (process.env.MYMUSCLE_ANDROID_CERT_SHA256 ?? ANDROID_PLAY_SIGNING_CERTIFICATE).split(",").map(s => s.trim().toUpperCase()).filter(s => /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s));
}
