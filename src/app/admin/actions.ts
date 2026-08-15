"use server";

import { redirect } from "next/navigation";

import {
  isValidAdminUsername,
  normalizeAdminUsername,
  resolveAdminEmail,
} from "@/lib/admin/credentials";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
  username: string;
};

export type PasswordResetRequestState = {
  error: string | null;
  sent: boolean;
};

const INVALID_LOGIN_MESSAGE = "Onjuiste gebruikersnaam of wachtwoord.";

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
    return { error: INVALID_LOGIN_MESSAGE, username };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: resolveAdminEmail(username),
    password,
  });

  if (signInError) return { error: INVALID_LOGIN_MESSAGE, username };

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_product_admin",
  );
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: INVALID_LOGIN_MESSAGE, username };
  }

  redirect("/admin");
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
  redirect("/admin/login");
}
