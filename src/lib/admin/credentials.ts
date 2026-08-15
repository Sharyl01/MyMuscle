import "server-only";

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,31}$/;

const readAliases = (): Record<string, string> => {
  const raw = process.env.ADMIN_LOGIN_ALIASES;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<Record<string, string>>(
      (aliases, [username, email]) => {
        const normalizedUsername = username.trim().toLowerCase();
        if (
          USERNAME_PATTERN.test(normalizedUsername) &&
          typeof email === "string" &&
          /^\S+@\S+\.\S+$/.test(email.trim())
        ) {
          aliases[normalizedUsername] = email.trim().toLowerCase();
        }
        return aliases;
      },
      {},
    );
  } catch {
    return {};
  }
};

export const normalizeAdminUsername = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const isValidAdminUsername = (username: string) =>
  USERNAME_PATTERN.test(username);

export const resolveAdminEmail = (username: string) =>
  readAliases()[username] ?? "invalid-admin-login@mymuscle.app";

export const usernameForAdminEmail = (email: string | undefined) => {
  if (!email) return "Beheerder";
  const match = Object.entries(readAliases()).find(
    ([, candidateEmail]) => candidateEmail === email.toLowerCase(),
  );
  return match?.[0] ?? "Beheerder";
};
