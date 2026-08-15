import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(tmpdir(), "atmos-design-audit");
const port = 3110;
const baseURL = `http://127.0.0.1:${port}`;

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Audit server did not become ready.");
}

async function captureSet(browser, name, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date("2026-08-14T20:07:00+02:00"));
  await page.emulateMedia({ reducedMotion: "reduce" });

  const capture = async (fileName, fullPage = false) => {
    await page.screenshot({
      animations: "disabled",
      fullPage,
      path: resolve(outputDirectory, `${fileName}-${name}.png`),
    });
  };

  await page.goto(`${baseURL}/compose?scene=rainy-apartment`);
  await page.waitForTimeout(400);
  await capture("composer", true);
  await page.getByRole("button", { name: "Save mix" }).click();
  await capture("name-mix");
  await page.getByRole("textbox", { name: "Mix name" }).fill("Rainy reading");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Your mixes" }).click();
  await capture("your-mixes");
  await page.getByRole("button", { name: "Delete Rainy reading" }).click();
  await capture("delete-mix");

  await page.goto(`${baseURL}/compose?scene=rainy-apartment`);
  await page.getByRole("button", { name: "Add sound" }).click();
  await capture("sound-library");

  await page.goto(`${baseURL}/atmosphere/rainy-apartment`);
  await page.waitForTimeout(400);
  await capture("player-current", true);
  if (name === "mobile") {
    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll("body *")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            className: element instanceof HTMLElement ? element.className : "",
            right: Math.round(rect.right),
            tag: element.tagName,
            text: element.textContent?.trim().slice(0, 60) ?? "",
          };
        })
        .filter(
          ({ right }) => right > document.documentElement.clientWidth + 1,
        ),
    }));
    console.log(JSON.stringify({ playerMobileGeometry: geometry }, null, 2));
  }
  await page.getByRole("button", { name: "Atmospheres" }).click();
  await capture("atmosphere-menu");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Preferences" }).click();
  await capture("preferences");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Timer" }).click();
  await capture("timer");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Focus", exact: true }).click();
  await capture("focus");

  await page.goto(`${baseURL}/atmosphere/not-a-place`);
  await capture("not-found");

  await page.goto(baseURL);
  await page.waitForTimeout(400);
  await capture("home-current", true);

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
    await captureSet(browser, "desktop", {
      viewport: { width: 1440, height: 900 },
    });
    await captureSet(browser, "mobile", {
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

console.log(outputDirectory);
