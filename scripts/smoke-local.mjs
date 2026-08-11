import { spawn } from "node:child_process";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const port = 3116;
const origin = `http://127.0.0.1:${port}/`;

function waitForServer() {
  return new Promise((resolvePromise, reject) => {
    let attempts = 0;
    const probe = async () => {
      attempts += 1;
      try {
        const response = await fetch(origin);
        if (response.ok) {
          resolvePromise();
          return;
        }
      } catch {
        // The production server is still starting.
      }
      if (attempts >= 40) {
        reject(new Error("The local production server did not start."));
        return;
      }
      setTimeout(probe, 250);
    };
    void probe();
  });
}

function runSmoke() {
  return new Promise((resolvePromise, reject) => {
    const smoke = spawn(
      process.execPath,
      [resolve(projectRoot, "scripts", "smoke-production.mjs")],
      {
        cwd: projectRoot,
        env: { ...process.env, ATMOS_PRODUCTION_URL: origin },
        stdio: "inherit",
      },
    );
    smoke.on("error", reject);
    smoke.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`Local smoke exited with code ${code}.`));
    });
  });
}

const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { cwd: projectRoot, stdio: "ignore" },
);

try {
  await waitForServer();
  await runSmoke();
} finally {
  server.kill();
}
