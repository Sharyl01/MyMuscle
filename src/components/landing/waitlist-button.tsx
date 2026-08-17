"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal, useFormStatus } from "react-dom";

import { joinWaitlist } from "@/app/waitlist/actions";
import { CtaButton } from "@/components/landing/cta-link";
import { initialWaitlistState } from "@/lib/waitlist/state";

type WaitlistButtonProps = {
  children?: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f766e,#0891b2)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_42px_rgba(8,145,178,0.2)] ring-1 ring-cyan-200/25 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Joining…" : "Join the waitlist"}
    </button>
  );
}

export function WaitlistButton({
  children = "Join Waitlist",
  variant = "primary",
  className = "",
}: WaitlistButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    joinWaitlist,
    initialWaitlistState,
  );
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <CtaButton
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </CtaButton>

      {open
        ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="surface-card glow-border relative w-full max-w-md rounded-2xl p-6 sm:p-8"
          >
            <button
              type="button"
              aria-label="Close waitlist form"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
              Early access
            </p>
            <h2
              id={titleId}
              className="font-display mt-3 pr-8 text-3xl font-semibold text-white"
            >
              Be first to know.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Leave your email and we’ll notify you when MyMuscle is almost
              ready to launch.
            </p>

            {state.status === "success" ? (
              <div
                role="status"
                className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100"
              >
                {state.message}
              </div>
            ) : (
              <form action={formAction} className="mt-6 space-y-4">
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor={`${titleId}-company`}>Company</label>
                  <input
                    id={`${titleId}-company`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${titleId}-email`}
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email address
                  </label>
                  <input
                    id={`${titleId}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    autoFocus
                    placeholder="you@example.com"
                    className="min-h-12 w-full rounded-xl border border-white/12 bg-black/25 px-4 text-base text-white placeholder:text-slate-600 focus:border-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/15"
                  />
                </div>
                {state.status === "error" ? (
                  <p role="alert" className="text-sm text-rose-300">
                    {state.message}
                  </p>
                ) : null}
                <SubmitButton />
              </form>
            )}

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Only launch-related MyMuscle updates. You can unsubscribe at any
              time. See our{" "}
              <Link href="/privacy" className="text-sky-300 hover:text-sky-200">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
