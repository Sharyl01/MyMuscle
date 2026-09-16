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
    env: { ...process.env, MYMUSCLE_E2E: "1" },
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
