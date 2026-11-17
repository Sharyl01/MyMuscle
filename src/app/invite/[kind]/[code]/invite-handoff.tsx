"use client";

import { useEffect, useRef } from "react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";
import { inviteDestination, startInviteHandoff } from "@/lib/invite-handoff";

export default function InviteHandoff({ kind, code }: { kind: "friend" | "group"; code: string }) {
  const path = `/invite/${kind}/${encodeURIComponent(code)}`, nativeUrl = `musclefront:/${path}`;
  const cleanup = useRef<(() => void) | null>(null);
  const openApp = () => {
    cleanup.current?.();
    cleanup.current = startInviteHandoff(inviteDestination(kind, code, navigator.userAgent, navigator.maxTouchPoints));
  };
  useEffect(() => {
    const destination = inviteDestination(kind, code, navigator.userAgent, navigator.maxTouchPoints);
    // Universal Links open installed apps before this page. The visible button
    // also supports browsers which require a fresh user gesture for handoff.
    if (destination.storeUrl) cleanup.current = startInviteHandoff(destination);
    return () => cleanup.current?.();
  }, [kind, code]);
  return <main style={{ minHeight: "100svh", display: "grid", placeContent: "center", padding: 24, background: "#f5f5f5", color: "#171717" }}>
    <section style={{ maxWidth: 460, display: "grid", gap: 20, padding: 28, background: "white", borderRadius: 24 }}>
      <p style={{ fontWeight: 800 }}>MyMuscle</p>
      <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>{kind === "group" ? "Train mee in de groep" : "Train samen met je vrienden"}</h1>
      <p>We openen de uitnodiging in MyMuscle. Zonder app ga je automatisch naar de App Store of Google Play.</p>
      <a href={nativeUrl} onClick={event => { event.preventDefault(); openApp(); }} style={{ padding: 16, borderRadius: 12, background: "#171717", color: "white", textAlign: "center", fontWeight: 700 }}>Open MyMuscle</a>
      <p>Open na het installeren dezelfde link opnieuw vanuit WhatsApp om de groep te openen.</p>
      <div style={{ display: "flex", gap: 24 }}><a href={APP_STORE_URL}>App Store</a><a href={GOOGLE_PLAY_URL}>Google Play</a></div>
      {kind === "group" ? <p>Groepcode: <strong>{code}</strong></p> : null}
      <p style={{ fontSize: 14 }}>Besloten groepen vereisen goedkeuring. Een vriendschapsverzoek wordt pas verstuurd nadat je dat zelf bevestigt.</p>
    </section>
  </main>;
}
