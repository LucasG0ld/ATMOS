import { chromium, expect } from "@playwright/test";

const productionUrl = new URL(
  process.env.ATMOS_PRODUCTION_URL ?? "https://lucasg0ld.github.io/ATMOS/",
);
const runtimeErrors = [];
const failedRequests = [];
const unexpectedResponses = [];
const audioRequests = [];
const atmospheres = [
  ["rainy-apartment", "Rainy Apartment"],
  ["quiet-coffee-shop", "Quiet Coffee Shop"],
  ["deep-forest", "Deep Forest"],
  ["fireplace", "Fireplace"],
];

const browser = await chromium.launch();
const context = await browser.newContext({
  serviceWorkers: "block",
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
const devtools = await context.newCDPSession(page);
await devtools.send("Network.enable");
await devtools.send("Network.setCacheDisabled", { cacheDisabled: true });

page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("request", (request) => {
  if (request.url().includes("/audio/")) audioRequests.push(request.url());
});
page.on("requestfailed", (request) => {
  // Next.js may cancel speculative HEAD probes once navigation data is ready.
  if (request.method() !== "HEAD") {
    failedRequests.push(
      `${request.method()} ${request.url()} (${request.failure()?.errorText ?? "unknown error"})`,
    );
  }
});
page.on("response", (response) => {
  if (response.status() >= 400) {
    unexpectedResponses.push(`${response.status()} ${response.url()}`);
  }
});

try {
  const homeResponse = await page.goto(productionUrl.href, {
    waitUntil: "networkidle",
  });
  expect(homeResponse?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      name: "What atmosphere do you need today?",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Atmospheres" }).getByRole("link"),
  ).toHaveCount(4);
  expect(audioRequests).toEqual([]);

  for (const [slug, name] of atmospheres) {
    const routeResponse = await page.goto(
      new URL(`atmosphere/${slug}/`, productionUrl).href,
      { waitUntil: "networkidle" },
    );
    expect(routeResponse?.status()).toBe(200);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.locator("[data-atmosphere-visual]")).toBeVisible();
    expect(audioRequests).toEqual([]);
  }

  await page.goto(new URL("atmosphere/rainy-apartment/", productionUrl).href, {
    waitUntil: "networkidle",
  });

  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();
  await expect(
    page.getByRole("button", { name: "Pause Rainy Apartment" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => new Set(audioRequests).size).toBe(3);

  await page.getByRole("button", { name: "Atmospheres" }).click();
  await page
    .getByRole("dialog", { name: "Atmospheres" })
    .getByRole("link", { name: /Deep Forest/ })
    .click();
  await expect(page).toHaveURL(/\/atmosphere\/deep-forest\/?$/);
  await expect(
    page.getByRole("button", { name: "Pause Deep Forest" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => new Set(audioRequests).size).toBe(6);
  await page.getByRole("button", { name: "Pause Deep Forest" }).click();

  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(unexpectedResponses).toEqual([]);

  const notFoundPage = await context.newPage();
  const notFoundUrl = new URL("atmosphere/unknown/", productionUrl);
  const notFoundResponse = await notFoundPage.goto(notFoundUrl.href);
  expect(notFoundResponse?.status()).toBe(404);
  await expect(
    notFoundPage.getByRole("heading", {
      name: "This atmosphere does not exist.",
    }),
  ).toBeVisible();

  console.log(
    `Production smoke passed: ${productionUrl.href} (cache disabled, 4 routes, audio transition, custom 404).`,
  );
} finally {
  await context.close();
  await browser.close();
}
