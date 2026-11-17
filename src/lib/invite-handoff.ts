import { APP_STORE_URL, GOOGLE_PLAY_URL } from "./app-links";

export const INVITE_STORE_FALLBACK_MS = 1800;
export type InviteDestination = { appUrl: string; storeUrl: string | null };

export function inviteDestination(kind: "friend" | "group", code: string, userAgent: string, maxTouchPoints = 0): InviteDestination {
  const path = `/invite/${kind}/${encodeURIComponent(code)}`;
  if (/Android/i.test(userAgent)) return {
    appUrl: `intent:/${path}#Intent;scheme=musclefront;package=com.apphletes.mymuscle;S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`,
    storeUrl: GOOGLE_PLAY_URL,
  };
  const ios = /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  return { appUrl: `musclefront:/${path}`, storeUrl: ios ? APP_STORE_URL : null };
}

/** Universal/app links usually bypass the website when installed. If a browser
 * does reach it, try the app and send an unsuccessful attempt to its store.
 * Cancel on app handoff so returning to WhatsApp/browser never opens the store. */
export function startInviteHandoff(destination: InviteDestination, browser: Window = window): () => void {
  let timer: number | undefined;
  const stop = () => {
    if (timer !== undefined) browser.clearTimeout(timer);
    browser.document.removeEventListener("visibilitychange", onVisibilityChange);
    browser.removeEventListener("pagehide", stop);
  };
  const onVisibilityChange = () => {
    if (browser.document.visibilityState === "hidden") stop();
  };
  const openStore = () => {
    const visible = browser.document.visibilityState === "visible";
    stop();
    if (visible && destination.storeUrl) browser.location.replace(destination.storeUrl);
  };
  if (browser.document.visibilityState === "hidden") return stop;
  browser.document.addEventListener("visibilitychange", onVisibilityChange);
  browser.addEventListener("pagehide", stop);
  if (destination.storeUrl) timer = browser.setTimeout(openStore, INVITE_STORE_FALLBACK_MS);
  try { browser.location.replace(destination.appUrl); }
  catch { openStore(); }
  return stop;
}
