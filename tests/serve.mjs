import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const server = spawn(
  process.execPath,
  [
    "--require",
    fileURLToPath(new URL("backend-fixture.cjs", import.meta.url)),
    require.resolve("next/dist/bin/next"),
    "start",
    "--port",
    "3100",
  ],
  {
    stdio: "inherit",
    env: { ...process.env, MYMUSCLE_E2E: "1",
      // The preload intercepts every backend request; never require real keys
      // merely to reach the isolated server-action fixtures.
      SUPABASE_SERVICE_ROLE_KEY: "fixture-only-not-a-real-key",
      ADMIN_2FA_SECRET: "fixture-only-website-ingress-secret-for-tests",
      ...(process.env.MYMUSCLE_CAPTCHA_E2E === "1" ? {
      ADMIN_LOGIN_ALIASES: JSON.stringify({ testadmin: "test-admin@example.invalid" }),
    } : {}) },
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
