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
    return { error: INVALID_LOGIN_MESSAGE };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: resolveAdminEmail(username),
    password,
  });

  if (signInError) return { error: INVALID_LOGIN_MESSAGE };

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_product_admin",
  );
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: INVALID_LOGIN_MESSAGE };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
