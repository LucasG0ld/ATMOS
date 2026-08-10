import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, ".cache", "performance");
const port = 3115;
const origin = `http://127.0.0.1:${port}`;
const targets = [
  ["Deep Forest", "deep-forest"],
  ["Fireplace", "fireplace"],
  ["Quiet Coffee Shop", "quiet-coffee-shop"],
  ["Rainy Apartment", "rainy-apartment"],
];

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

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
  const page = await browser.newPage();
  const audioRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext;
    window.__atmosAudioContextCount = 0;
    window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, argumentsList) {
        window.__atmosAudioContextCount += 1;
        return Reflect.construct(target, argumentsList);
      },
    });
  });

  await page.goto(`${origin}/atmosphere/rainy-apartment`);
  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();
  await page
    .getByRole("button", { name: "Pause Rainy Apartment" })
    .waitFor({ timeout: 15_000 });
  const client = await page.context().newCDPSession(page);
  await client.send("HeapProfiler.collectGarbage");
  const initialHeapBytes = await page.evaluate(
    () => performance.memory?.usedJSHeapSize ?? 0,
  );

  for (let index = 0; index < 10; index += 1) {
    const [name] = targets[index % targets.length];
    await page.getByRole("button", { name: "Atmospheres" }).click();
    await page
      .getByRole("dialog", { name: "Atmospheres" })
      .getByRole("link", { name: new RegExp(name) })
      .click();
    await page
      .getByRole("button", { name: `Pause ${name}` })
      .waitFor({ timeout: 15_000 });
  }

  await page.waitForTimeout(2_000);
  await client.send("HeapProfiler.collectGarbage");
  const finalHeapBytes = await page.evaluate(
    () => performance.memory?.usedJSHeapSize ?? 0,
  );
  const audioContextCount = await page.evaluate(
    () => window.__atmosAudioContextCount,
  );
  if (audioContextCount !== 1) {
    throw new Error(
      `Expected one AudioContext, received ${audioContextCount}.`,
    );
  }

  const summary = {
    transitions: 10,
    audioContextCount,
    audioRequestCount: audioRequests.length,
    uniqueAudioRequestCount: new Set(audioRequests).size,
    initialHeapBytes,
    finalHeapBytes,
    heapDeltaBytes: finalHeapBytes - initialHeapBytes,
  };
  await writeFile(
    resolve(outputDirectory, "runtime-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  console.table([summary]);
} finally {
  await browser?.close();
  server.kill();
}
