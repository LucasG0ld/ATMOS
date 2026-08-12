import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, ".cache", "lighthouse");
const port = 3114;
const chromePort = 9224;
const origin = `http://127.0.0.1:${port}`;
const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  throw new Error(
    "Run this measurement through npm run performance:lighthouse.",
  );
}
const npxCli = resolve(dirname(npmExecPath), "npx-cli.js");
const allRoutes = [
  ["home", "/"],
  ["rainy-apartment", "/atmosphere/rainy-apartment"],
  ["quiet-coffee-shop", "/atmosphere/quiet-coffee-shop"],
  ["deep-forest", "/atmosphere/deep-forest"],
  ["fireplace", "/atmosphere/fireplace"],
  ["composer", "/compose"],
];
const requestedRoute = process.argv[2];
const requestedProfile = process.argv[3];
const routes = requestedRoute
  ? allRoutes.filter(([label]) => label === requestedRoute)
  : allRoutes;
const profiles = requestedProfile ? [requestedProfile] : ["mobile", "desktop"];
if (routes.length === 0) throw new Error(`Unknown route: ${requestedRoute}.`);
if (profiles.some((profile) => !["mobile", "desktop"].includes(profile))) {
  throw new Error(`Unknown profile: ${requestedProfile}.`);
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, CHROME_PATH: chromium.executablePath() },
      shell: false,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with code ${code}.`));
    });
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("The local production server did not start.");
}

async function waitForChrome() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(
        `http://127.0.0.1:${chromePort}/json/version`,
      );
      if (response.ok) return;
    } catch {
      // Chromium is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Chromium did not expose its debugging endpoint.");
}

function metric(report, auditId) {
  return Math.round(report.audits[auditId].numericValue);
}

await mkdir(outputDirectory, { recursive: true });
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
const chrome = spawn(
  chromium.executablePath(),
  [
    "--headless",
    "--no-sandbox",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${resolve(outputDirectory, `chrome-${Date.now()}`)}`,
  ],
  { cwd: projectRoot, stdio: "ignore" },
);

const summary = [];
try {
  await waitForServer();
  await waitForChrome();
  for (const [label, path] of routes) {
    for (const profile of profiles) {
      const outputPath = resolve(outputDirectory, `${label}-${profile}.json`);
      const args = [
        "--yes",
        "lighthouse@13.4.1",
        `${origin}${path}`,
        "--quiet",
        `--port=${chromePort}`,
        "--output=json",
        `--output-path=${outputPath}`,
      ];
      if (profile === "desktop") args.push("--preset=desktop");
      await run(process.execPath, [npxCli, ...args]);

      const report = JSON.parse(await readFile(outputPath, "utf8"));
      summary.push({
        route: label,
        profile,
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(
          report.categories["best-practices"].score * 100,
        ),
        seo: Math.round(report.categories.seo.score * 100),
        fcpMs: metric(report, "first-contentful-paint"),
        lcpMs: metric(report, "largest-contentful-paint"),
        tbtMs: metric(report, "total-blocking-time"),
        cls: Number(
          report.audits["cumulative-layout-shift"].numericValue.toFixed(3),
        ),
      });
    }
  }
} finally {
  chrome.kill();
  server.kill();
}

await writeFile(
  resolve(outputDirectory, "summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.table(summary);
