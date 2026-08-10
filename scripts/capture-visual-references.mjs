import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "docs", "quality", "references");
const port = 3109;
const baseURL = `http://127.0.0.1:${port}`;

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("The visual reference server did not become ready.");
}

async function capture(browser, name, options) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date("2026-08-10T20:07:00+02:00"));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of [
    { path: "/", suffix: "home" },
    { path: "/atmosphere/rainy-apartment", suffix: "player" },
  ]) {
    await page.goto(`${baseURL}${route.path}`);
    await page.waitForTimeout(800);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: resolve(outputDirectory, `${route.suffix}-${name}.png`),
    });
  }

  await context.close();
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

try {
  await waitForServer();
  const browser = await chromium.launch();
  try {
    await capture(browser, "desktop", {
      viewport: { width: 1440, height: 900 },
    });
    await capture(browser, "mobile", {
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 812 },
    });
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}

console.log(`Visual references updated in ${outputDirectory}`);
