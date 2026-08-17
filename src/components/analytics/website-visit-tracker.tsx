"use client";

import { useEffect } from "react";

let reportedThisPageLoad = false;

export function WebsiteVisitTracker() {
  useEffect(() => {
    if (reportedThisPageLoad) return;
    reportedThisPageLoad = true;

    let sessionId: string;
    try {
      sessionId = sessionStorage.getItem("mymuscle_website_session") ?? "";
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("mymuscle_website_session", sessionId);
      }
    } catch {
      sessionId = crypto.randomUUID();
    }

    void fetch("/api/analytics/website-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path: "/" }),
      keepalive: true,
    });
  }, []);

  return null;
}
