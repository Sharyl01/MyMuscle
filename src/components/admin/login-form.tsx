"use client";

import { FormEvent, useActionState, useEffect, useState } from "react";

import {
  login,
  requestPasswordReset,
  type LoginState,
  type PasswordResetRequestState,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

const initialState: LoginState = { error: null, username: "" };
const initialResetState: PasswordResetRequestState = {
  error: null,
  sent: false,
};

function RecoveryForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("newPassword");
    const confirmation = formData.get("passwordConfirmation");

    if (typeof password !== "string" || password.length < 12) {
      setError("Gebruik minimaal 12 tekens voor je nieuwe wachtwoord.");
      return;
    }

    if (password !== confirmation) {
      setError("De twee wachtwoorden zijn niet hetzelfde.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setPending(false);
      setError("Dit herstelverzoek is ongeldig of verlopen. Vraag een nieuwe resetmail aan.");
      return;
    }

    // End every refresh session after the password change. This also revokes
    // the recovery session that arrived through the email link.
    await supabase.auth.signOut({ scope: "global" });
    window.history.replaceState(null, "", "/admin/login");
    window.location.replace("/admin/login?password=updated");
  }

  return (
    <form onSubmit={updatePassword} className="mt-8 space-y-5">
      <div>
        <label htmlFor="newPassword" className="text-sm font-semibold text-slate-200">
          Nieuw wachtwoord
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirmation"
          className="text-sm font-semibold text-slate-200"
        >
          Herhaal nieuw wachtwoord
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-xl bg-[linear-gradient(120deg,#facc15,#34d399_52%,#60a5fa)] px-5 py-3.5 font-display text-sm font-bold text-zinc-950 shadow-[0_16px_45px_rgba(52,211,153,0.2)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Wachtwoord opslaan…" : "Nieuw wachtwoord opslaan"}
      </button>
    </form>
  );
}

export function LoginForm({ passwordUpdated = false }: { passwordUpdated?: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordReset,
    initialResetState,
  );
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") !== "recovery") return;

    let active = true;
    const supabase = createClient();

    const finishRecovery = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error || !data.session) {
        setRecoveryError("Deze herstel-link is ongeldig of verlopen.");
        return;
      }

      setRecoveryReady(true);
    };

    void finishRecovery();
    return () => {
      active = false;
    };
  }, []);

  if (recoveryReady) return <RecoveryForm />;

  if (recoveryError) {
    return (
      <div className="mt-8 space-y-4">
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {recoveryError}
        </p>
        <button
          type="button"
          onClick={() => {
            window.history.replaceState(null, "", "/admin/login");
            setRecoveryError(null);
            setShowResetRequest(true);
          }}
          className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Nieuwe resetmail aanvragen
        </button>
      </div>
    );
  }

  if (showResetRequest) {
    return (
      <form action={resetAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="resetUsername" className="text-sm font-semibold text-slate-200">
            Gebruikersnaam
          </label>
          <input
            id="resetUsername"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={32}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.username}
            className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
            placeholder="jouw gebruikersnaam"
          />
        </div>

        {resetState.sent ? (
          <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Als deze beheerder bestaat, is er een resetmail verstuurd. Open de nieuwste e-mail.
          </p>
        ) : null}

        {resetState.error ? (
          <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {resetState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={resetPending}
          className="flex w-full items-center justify-center rounded-xl bg-[linear-gradient(120deg,#facc15,#34d399_52%,#60a5fa)] px-5 py-3.5 font-display text-sm font-bold text-zinc-950 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {resetPending ? "Resetmail versturen…" : "Stuur resetmail"}
        </button>

        <button
          type="button"
          onClick={() => setShowResetRequest(false)}
          className="w-full text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          Terug naar inloggen
        </button>
      </form>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {passwordUpdated ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
        >
          Je wachtwoord is aangepast. Je kunt nu inloggen.
        </p>
      ) : null}

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
          defaultValue={state.username}
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

      <button
        type="button"
        onClick={() => setShowResetRequest(true)}
        className="w-full text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        Wachtwoord vergeten?
      </button>
    </form>
  );
}
