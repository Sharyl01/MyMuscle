"use client";

import { startTransition, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { CAPTCHA_ERROR, TURNSTILE_SITE_KEY } from "@/lib/security/turnstile";

// Acquire a new single-use token at submit time, including on password-reset
// retries. No cached token can accidentally be reused by another form/action.
export function CaptchaForm({ action, className, children }: {
  action: (data: FormData) => void;
  className?: string;
  children: ReactNode;
}) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const pending = useRef<{ id: string; data: FormData } | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const fail = () => { pending.current = null; setRequestId(null); setError(CAPTCHA_ERROR); };
    const timer = window.setTimeout(fail, 120_000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const request = pending.current;
      const value = event.data;
      if (!request || value?.requestId !== request.id) return;
      if (value.type === "mymuscle-captcha-error") { fail(); return; }
      if (value.type !== "mymuscle-captcha" || typeof value.token !== "string" || !value.token || value.token.length > 2048) return;
      pending.current = null;
      window.clearTimeout(timer);
      setRequestId(null);
      request.data.set("captchaToken", value.token);
      startTransition(() => action(request.data));
    };
    window.addEventListener("message", receive);
    return () => { window.clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [requestId, action]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const id = crypto.randomUUID();
    pending.current = { id, data: new FormData(event.currentTarget) };
    setError(null);
    setRequestId(id);
  }

  return <form onSubmit={submit} className={className}>
    <fieldset disabled={Boolean(requestId)} className="contents">{children}</fieldset>
    {requestId ? <div role="group" aria-label="Beveiligingscontrole" className="rounded-xl bg-white p-3 text-slate-900">
      <iframe ref={frame} title="Beveiligingscontrole" referrerPolicy="no-referrer"
        src={`/security/captcha.html?sitekey=${TURNSTILE_SITE_KEY}&language=nl&requestId=${requestId}`}
        onError={() => { pending.current = null; setRequestId(null); setError(CAPTCHA_ERROR); }}
        className="h-64 w-full border-0" />
      <button type="button" className="p-2 text-sm font-semibold" onClick={() => { pending.current = null; setRequestId(null); }}>Annuleren</button>
    </div> : null}
    {error ? <p role="alert" className="text-sm text-red-200">{error}</p> : null}
  </form>;
}
