"use client";

import { useEffect } from "react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";

export default function InviteHandoff({ kind, code }: { kind: "friend" | "group"; code: string }) {
  const path = `/invite/${kind}/${encodeURIComponent(code)}`, nativeUrl = `musclefront:/${path}`;
  const openUrl = () => /Android/i.test(navigator.userAgent)
    ? `intent:/${path}#Intent;scheme=musclefront;package=com.apphletes.mymuscle;S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`
    : nativeUrl;
  useEffect(() => {
    const destination = /Android/i.test(navigator.userAgent)
      ? `intent:/${path}#Intent;scheme=musclefront;package=com.apphletes.mymuscle;S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`
      : nativeUrl;
    // Universal Links open installed apps before this page. The visible button
    // also supports browsers which require a fresh user gesture for handoff.
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.replace(destination);
  }, [nativeUrl, path]);
  return <main style={{ minHeight: "100svh", display: "grid", placeContent: "center", padding: 24, background: "#f5f5f5", color: "#171717" }}>
    <section style={{ maxWidth: 460, display: "grid", gap: 20, padding: 28, background: "white", borderRadius: 24 }}>
      <p style={{ fontWeight: 800 }}>MyMuscle</p>
      <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>{kind === "group" ? "Train mee in de groep" : "Train samen met je vrienden"}</h1>
      <p>Open de uitnodiging in MyMuscle. Na het inloggen kun je verder met deze uitnodiging.</p>
      <a href={nativeUrl} onClick={event => { event.preventDefault(); window.location.assign(openUrl()); }} style={{ padding: 16, borderRadius: 12, background: "#171717", color: "white", textAlign: "center", fontWeight: 700 }}>Open MyMuscle</a>
      <p>Heb je de app nog niet? Installeer MyMuscle en open daarna deze link opnieuw vanuit je bericht.</p>
      <div style={{ display: "flex", gap: 24 }}><a href={APP_STORE_URL}>App Store</a><a href={GOOGLE_PLAY_URL}>Google Play</a></div>
      {kind === "group" ? <p>Groepcode: <strong>{code}</strong></p> : null}
      <p style={{ fontSize: 14 }}>Besloten groepen vereisen goedkeuring. Een vriendschapsverzoek wordt pas verstuurd nadat je dat zelf bevestigt.</p>
    </section>
  </main>;
}
