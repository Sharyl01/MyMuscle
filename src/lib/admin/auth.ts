import "server-only";

import { redirect } from "next/navigation";

import { usernameForAdminEmail } from "@/lib/admin/credentials";
import { createClient } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  username: string;
};

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const subject = claims?.sub;

  if (claimsError || typeof subject !== "string") return null;

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_product_admin",
  );
  if (adminError || isAdmin !== true) return null;

  const email =
    typeof claims?.email === "string"
      ? claims.email
      : undefined;

  return {
    id: subject,
    username: usernameForAdminEmail(email),
  };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  return identity;
}
