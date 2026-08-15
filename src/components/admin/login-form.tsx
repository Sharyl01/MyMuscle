"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="username"
          className="text-sm font-semibold text-slate-200"
        >
          Gebruikersnaam
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={32}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
          placeholder="jouw gebruikersnaam"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-200"
        >
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
          placeholder="••••••••••••"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-xl bg-[linear-gradient(120deg,#facc15,#34d399_52%,#60a5fa)] px-5 py-3.5 font-display text-sm font-bold text-zinc-950 shadow-[0_16px_45px_rgba(52,211,153,0.2)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Bezig met inloggen…" : "Open dashboard"}
      </button>
    </form>
  );
}
