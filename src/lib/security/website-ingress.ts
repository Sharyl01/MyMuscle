import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export async function submitWebsiteEvent(kind: "waitlist" | "visit", payload: Record<string, string>) {
  const requestHeaders = await headers();
  // Vercel supplies this header at its trusted ingress. Never take an IP from the body.
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const secret = process.env.ADMIN_2FA_SECRET;
  if (!secret || secret.length < 32) throw new Error("Website security is unavailable");
  const clientHash = createHmac("sha256", secret)
    .update(`website:${new Date().toISOString().slice(0, 10)}:${ip}`).digest("hex");
  const { data, error } = await createServiceClient().rpc("website_submit_v1", { kind, payload, client_hash: clientHash });
  if (error) throw new Error("Website submission failed");
  return data as { limited?: boolean; invalid?: boolean; inserted?: boolean };
}
