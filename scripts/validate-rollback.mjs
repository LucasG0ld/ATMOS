import { chromium, expect } from "@playwright/test";

const rollbackUrl = new URL(
  process.env.ATMOS_ROLLBACK_URL ?? "https://lucasg0ld.github.io/ATMOS/",
);
const storageKey = "atmos.preferences";
const v2Snapshot = {
  version: 2,
  favoriteAtmosphereIds: ["rainy-apartment"],
  layerVolumes: {
    "rainy-apartment": { rain: 0.31 },
  },
  savedMixes: [
    {
      id: "rollback-v2-mix",
      name: "Rollback proof",
      sceneAtmosphereId: "rainy-apartment",
      layers: [
        {
          sound: {
            atmosphereId: "rainy-apartment",
            layerId: "rain",
          },
          volume: 0.31,
        },
      ],
    },
  ],
};
const serializedSnapshot = JSON.stringify(v2Snapshot);

const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const runtimeErrors = [];
const audioRequests = [];

page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("request", (request) => {
  if (request.url().includes("/audio/")) audioRequests.push(request.url());
});

try {
  await page.addInitScript(
    ({ key, snapshot }) => localStorage.setItem(key, snapshot),
    { key: storageKey, snapshot: serializedSnapshot },
  );
  const response = await page.goto(rollbackUrl.href, {
    waitUntil: "networkidle",
  });

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "What atmosphere do you need today?" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Your mixes" })).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(serializedSnapshot);
  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);

  console.log(
    `Rollback compatibility passed: ${rollbackUrl.href} ignores and preserves a V2 snapshot without audio or runtime error.`,
  );
} finally {
  await context.close();
  await browser.close();
}
