// Set verified public store URLs at release time. Until then the existing
// landing page is the working destination. Never infer release from the date.
export function appDownloadDestination(userAgent: string) {
  const ios = /iPhone|iPad|iPod|Macintosh.*Mobile/i.test(userAgent);
  const android = /Android/i.test(userAgent);
  const configured = ios ? process.env.MYMUSCLE_APP_STORE_URL : android ? process.env.MYMUSCLE_GOOGLE_PLAY_URL : undefined;
  try {
    if (configured) {
      const url = new URL(configured);
      if (url.protocol === "https:" && !url.username && !url.password && !url.port && (
        (ios && url.hostname === "apps.apple.com" && /\/id\d+$/.test(url.pathname)) ||
        (android && url.hostname === "play.google.com" && url.pathname === "/store/apps/details" && url.searchParams.get("id") === "com.apphletes.mymuscle")
      )) return url.href;
    }
  } catch { /* fail closed to the real landing page */ }
  return "https://mymuscle.app/#waitlist";
}
export function androidFingerprints() {
  return (process.env.MYMUSCLE_ANDROID_CERT_SHA256 ?? "").split(",").map(s => s.trim().toUpperCase()).filter(s => /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s));
}
