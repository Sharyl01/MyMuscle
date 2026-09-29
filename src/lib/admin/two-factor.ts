import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

const PENDING_COOKIE = "mymuscle_admin_2fa_pending";
const VERIFIED_COOKIE = "mymuscle_admin_2fa_verified";
const CHALLENGE_LIFETIME_SECONDS = 10 * 60;
const VERIFICATION_LIFETIME_SECONDS = 8 * 60 * 60;

export const ADMIN_CODE_LENGTH = 6;
export const MAX_ADMIN_CODE_ATTEMPTS = 5;

type PendingChallenge = {
  challengeId: string;
  kind: "pending";
  version: 1;
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  nonce: string;
  codeHash: string;
  attempts: number;
  expiresAt: number;
};

type VerifiedChallenge = {
  kind: "verified";
  version: 1;
  userId: string;
  sessionId: string;
  expiresAt: number;
};

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
  maxAge,
  priority: "high" as const,
});

const getSecret = () => {
  const secret = process.env.ADMIN_2FA_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_2FA_SECRET moet minimaal 32 tekens lang zijn.");
  }
  return secret;
};

const encryptionKey = () =>
  createHash("sha256").update(getSecret(), "utf8").digest();

const seal = (value: PendingChallenge | VerifiedChallenge, purpose: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(`mymuscle:${purpose}:v1`, "utf8"));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, ciphertext, tag]
    .map((part) => part.toString("base64url"))
    .join(".");
};

const open = <T>(token: string, purpose: string): T | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [ivValue, ciphertextValue, tagValue] = parts;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAAD(Buffer.from(`mymuscle:${purpose}:v1`, "utf8"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
};

const hashCode = (nonce: string, code: string) =>
  createHmac("sha256", getSecret())
    .update(`${nonce}:${code}`, "utf8")
    .digest("base64url");

export async function createPendingChallenge({
  userId,
  username,
  email,
  session,
  sessionId,
}: {
  userId: string;
  username: string;
  email: string;
  session: Session;
  sessionId: string;
}) {
  const code = randomInt(0, 10 ** ADMIN_CODE_LENGTH)
    .toString()
    .padStart(ADMIN_CODE_LENGTH, "0");
  const nonce = randomBytes(18).toString("base64url");
  const challenge: PendingChallenge = {
    challengeId: randomUUID(),
    kind: "pending",
    version: 1,
    userId,
    username,
    email,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    nonce,
    codeHash: hashCode(nonce, code),
    attempts: 0,
    expiresAt: Date.now() + CHALLENGE_LIFETIME_SECONDS * 1000,
  };

  const { error } = await createServiceClient().rpc("admin_challenge_create_v1", {
    challenge_id: challenge.challengeId, actor: userId, session_id: sessionId, code_hash: challenge.codeHash,
  });
  if (error) throw new Error("Admin challenge could not be created");
  return { challenge, code };
}

export async function setPendingChallenge(challenge: PendingChallenge) {
  const cookieStore = await cookies();
  cookieStore.set(
    PENDING_COOKIE,
    seal(challenge, "admin-2fa-pending"),
    cookieOptions(CHALLENGE_LIFETIME_SECONDS),
  );
}

export async function getPendingChallenge(): Promise<PendingChallenge | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  const challenge = open<PendingChallenge>(token, "admin-2fa-pending");
  if (
    !challenge ||
    challenge.kind !== "pending" ||
    challenge.version !== 1 ||
    challenge.expiresAt <= Date.now() ||
    typeof challenge.challengeId !== "string"
  ) {
    return null;
  }
  const { data, error } = await createServiceClient().rpc("admin_challenge_status_v1", { challenge_id: challenge.challengeId });
  return !error && data === true ? challenge : null;
}

export async function hasPendingChallenge() {
  return (await getPendingChallenge()) !== null;
}

export function pendingCodeMatches(
  challenge: PendingChallenge,
  submittedCode: string,
) {
  if (!new RegExp(`^\\d{${ADMIN_CODE_LENGTH}}$`).test(submittedCode)) {
    return false;
  }
  const actual = Buffer.from(hashCode(challenge.nonce, submittedCode));
  const expected = Buffer.from(challenge.codeHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function verifyPendingChallenge(challenge: PendingChallenge, code: string) {
  const { data, error } = await createServiceClient().rpc("admin_challenge_verify_v1", {
    challenge_id: challenge.challengeId, submitted_hash: hashCode(challenge.nonce, code),
  });
  if (error) throw new Error("Admin verification is unavailable");
  return data as { verified: boolean; remaining: number };
}

export async function deletePendingChallenge() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE);
}

export async function setVerifiedChallenge({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  const cookieStore = await cookies();
  const challenge: VerifiedChallenge = {
    kind: "verified",
    version: 1,
    userId,
    sessionId,
    expiresAt: Date.now() + VERIFICATION_LIFETIME_SECONDS * 1000,
  };
  cookieStore.set(
    VERIFIED_COOKIE,
    seal(challenge, "admin-2fa-verified"),
    cookieOptions(VERIFICATION_LIFETIME_SECONDS),
  );
}

export async function isTwoFactorVerified({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(VERIFIED_COOKIE)?.value;
  if (!token) return false;
  const challenge = open<VerifiedChallenge>(token, "admin-2fa-verified");
  return Boolean(
    challenge &&
      challenge.kind === "verified" &&
      challenge.version === 1 &&
      challenge.userId === userId &&
      challenge.sessionId === sessionId &&
      challenge.expiresAt > Date.now(),
  );
}

export async function clearTwoFactorCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE);
  cookieStore.delete(VERIFIED_COOKIE);
}

export async function clearSupabaseAuthCookies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return;

  const projectReference = new URL(supabaseUrl).hostname.split(".")[0];
  const cookiePrefix = `sb-${projectReference}-auth-token`;
  const cookieStore = await cookies();
  cookieStore
    .getAll()
    .filter(
      ({ name }) => name === cookiePrefix || name.startsWith(`${cookiePrefix}.`),
    )
    .forEach(({ name }) => cookieStore.delete(name));
}
