"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { WEBSITE_STATISTICS_CONSENT, WEBSITE_STATISTICS_COOKIE, WEBSITE_STATISTICS_SESSION } from "@/lib/website-statistics";
import s from "./website-visit-tracker.module.css";

let reportedThisPageLoad = false;
let request: AbortController | null = null;
const choiceEvent = "mymuscle-website-statistics-choice";
const getChoice = () => document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith(`${WEBSITE_STATISTICS_COOKIE}=`))?.split("=")[1] ?? "pending";
const serverChoice = () => "server";
const subscribe = (listener: () => void) => {
  window.addEventListener(choiceEvent, listener);
  window.addEventListener("focus", listener);
  return () => { window.removeEventListener(choiceEvent, listener); window.removeEventListener("focus", listener); };
};

export function WebsiteVisitTracker() {
  const choice = useSyncExternalStore(subscribe, getChoice, serverChoice);
  const [editing, setEditing] = useState(false);
  const allowed = choice === WEBSITE_STATISTICS_CONSENT;
  const choose = (allow: boolean) => {
    document.cookie = `${WEBSITE_STATISTICS_COOKIE}=${allow ? WEBSITE_STATISTICS_CONSENT : "no"}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    if (!allow) {
      request?.abort();
      request = null;
      reportedThisPageLoad = false;
      try { sessionStorage.removeItem(WEBSITE_STATISTICS_SESSION); } catch { /* Storage may be disabled. */ }
    }
    setEditing(false);
    window.dispatchEvent(new Event(choiceEvent));
  };

  useEffect(() => {
    if (!allowed) {
      if (getChoice() !== WEBSITE_STATISTICS_CONSENT) {
        request?.abort();
        request = null;
        reportedThisPageLoad = false;
        try { sessionStorage.removeItem(WEBSITE_STATISTICS_SESSION); } catch { /* Storage may be disabled. */ }
      }
      return;
    }
    if (reportedThisPageLoad) return;
    reportedThisPageLoad = true;

    let sessionId: string;
    try {
      sessionId = sessionStorage.getItem(WEBSITE_STATISTICS_SESSION) ?? "";
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(WEBSITE_STATISTICS_SESSION, sessionId);
      }
    } catch {
      sessionId = crypto.randomUUID();
    }

    request = new AbortController();
    void fetch("/api/analytics/website-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path: "/", consent: WEBSITE_STATISTICS_CONSENT }),
      signal: request.signal,
      keepalive: true,
    }).catch(() => { /* Optional statistics never interrupt the website. */ });
  }, [allowed]);

  return <div className={s.container}>
    <button type="button" className={s.preferences} onClick={() => setEditing(true)}>Website statistics</button>
    {choice === "pending" || editing ? <section className={s.panel} aria-label="Website statistics preferences">
      <strong>Optional website statistics</strong>
      <p>May we count page views and browser sessions? We only store a random session code after you allow this. Your choice does not affect the website. Change it here at any time. <Link href="/privacy">About website statistics</Link></p>
      <div className={s.actions}>
        <button type="button" onClick={() => choose(false)}>No statistics</button>
        <button type="button" onClick={() => choose(true)}>Allow statistics</button>
      </div>
    </section> : null}
  </div>;
}
