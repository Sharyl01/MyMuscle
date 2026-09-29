"use server";

import { redirect } from "next/navigation";

import {
  isValidAdminUsername,
  normalizeAdminUsername,
  resolveAdminEmail,
} from "@/lib/admin/credentials";
import {
  clearSupabaseAuthCookies,
  clearTwoFactorCookies,
  createPendingChallenge,
  deletePendingChallenge,
  getPendingChallenge,
  verifyPendingChallenge,
  setPendingChallenge,
  setVerifiedChallenge,
} from "@/lib/admin/two-factor";
import { sendAdminVerificationCode } from "@/lib/email/admin-verification";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
  username: string;
  verificationPending: boolean;
};

export type VerificationState = {
  error: string | null;
  active: boolean;
};

export type PasswordResetRequestState = {
  error: string | null;
  sent: boolean;
};

const INVALID_LOGIN_MESSAGE = "Onjuiste gebruikersnaam of wachtwoord.";
const VERIFICATION_EXPIRED_MESSAGE =
  "Deze verificatiepoging is verlopen. Log opnieuw in.";

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = normalizeAdminUsername(formData.get("username"));
  const password = formData.get("password");

  if (
    !isValidAdminUsername(username) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return {
      error: INVALID_LOGIN_MESSAGE,
      username,
      verificationPending: false,
    };
  }

  await clearTwoFactorCookies();
  const supabase = await createClient();
  const email = resolveAdminEmail(username);
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user || !signInData.session) {
    return {
      error: INVALID_LOGIN_MESSAGE,
      username,
      verificationPending: false,
    };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_product_admin",
  );
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      error: INVALID_LOGIN_MESSAGE,
      username,
      verificationPending: false,
    };
  }

  try {
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const sessionId = claimsData?.claims?.session_id;
    if (claimsError || typeof sessionId !== "string") throw new Error("Session verification failed");
    const { challenge, code } = await createPendingChallenge({
      userId: signInData.user.id,
      username,
      email,
      session: signInData.session,
      sessionId,
    });
    const emailSent = await sendAdminVerificationCode({
      email,
      code,
      challengeId: challenge.nonce,
    });

    if (!emailSent) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        error:
          "De verificatiecode kon niet worden verstuurd. Probeer het later opnieuw.",
        username,
        verificationPending: false,
      };
    }

    await setPendingChallenge(challenge);
    // Until the code is accepted, the real session only exists inside the
    // encrypted HttpOnly challenge and cannot call Supabase from the browser.
    await clearSupabaseAuthCookies();
    return { error: null, username, verificationPending: true };
  } catch (error) {
    console.error("Admin two-factor challenge could not be created", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    await supabase.auth.signOut({ scope: "local" });
    return {
      error: "De extra loginbeveiliging is niet correct geconfigureerd.",
      username,
      verificationPending: false,
    };
  }
}

export async function verifyAdminCode(
  _state: VerificationState,
  formData: FormData,
): Promise<VerificationState> {
  const submittedCode = formData.get("verificationCode");
  const code =
    typeof submittedCode === "string"
      ? submittedCode.replace(/\s/g, "")
      : "";
  const challenge = await getPendingChallenge();

  if (!challenge) {
    await deletePendingChallenge();
    return { error: VERIFICATION_EXPIRED_MESSAGE, active: false };
  }

  let verification: { verified: boolean; remaining: number };
  try { verification = await verifyPendingChallenge(challenge, code); }
  catch { return { error: "Verificatie is tijdelijk niet beschikbaar. Probeer opnieuw.", active: true }; }
  if (!verification.verified) {
    const remainsActive = verification.remaining > 0;
    if (!remainsActive) await deletePendingChallenge();
    return {
      error: remainsActive
        ? `Onjuiste code. Je hebt nog ${verification.remaining} poging(en).`
        : "Te veel onjuiste pogingen. Log opnieuw in.",
      active: remainsActive,
    };
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: challenge.accessToken,
      refresh_token: challenge.refreshToken,
    });

  if (
    sessionError ||
    !sessionData.user ||
    sessionData.user.id !== challenge.userId
  ) {
    await clearTwoFactorCookies();
    await clearSupabaseAuthCookies();
    return { error: VERIFICATION_EXPIRED_MESSAGE, active: false };
  }

  const [{ data: isAdmin, error: adminError }, claimsResult] =
    await Promise.all([
      supabase.rpc("admin_session_verified_v1"),
      supabase.auth.getClaims(),
    ]);
  const sessionId = claimsResult.data?.claims?.session_id;

  if (
    adminError ||
    isAdmin !== true ||
    claimsResult.error ||
    typeof sessionId !== "string"
  ) {
    await supabase.auth.signOut({ scope: "local" });
    await clearTwoFactorCookies();
    return { error: VERIFICATION_EXPIRED_MESSAGE, active: false };
  }

  await setVerifiedChallenge({ userId: challenge.userId, sessionId });
  await deletePendingChallenge();
  redirect("/admin");
}

export async function cancelAdminVerification() {
  const challenge = await getPendingChallenge();
  if (challenge) {
    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({
      access_token: challenge.accessToken,
      refresh_token: challenge.refreshToken,
    });
    if (!error) await supabase.auth.signOut({ scope: "local" });
  }
  await clearTwoFactorCookies();
  await clearSupabaseAuthCookies();
  redirect("/admin/login");
}

export async function requestPasswordReset(
  _state: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const username = normalizeAdminUsername(formData.get("username"));

  // Keep the response the same for unknown usernames so this endpoint does not
  // reveal which private administrator accounts exist.
  if (!isValidAdminUsername(username)) {
    return { error: null, sent: true };
  }

  const email = resolveAdminEmail(username);
  if (email === "invalid-admin-login@mymuscle.app") {
    return { error: null, sent: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://mymuscle.app/admin/login",
  });

  if (error) {
    return {
      error: "De resetmail kon niet worden verstuurd. Probeer het later opnieuw.",
      sent: false,
    };
  }

  return { error: null, sent: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  await clearTwoFactorCookies();
  redirect("/admin/login");
}
