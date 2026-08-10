import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoSeriousAccessibilityViolation(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const blockingViolations = result.violations.filter(
    ({ impact }) => impact === "critical" || impact === "serious",
  );
  expect(blockingViolations).toEqual([]);
}

test("critical journey defers audio and remains recoverable", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "What atmosphere do you need today?",
    }),
  ).toBeVisible();
  expect(audioRequests).toEqual([]);

  await page.getByRole("link", { name: /Rainy Apartment/ }).click();
  await expect(
    page.getByRole("heading", { name: "Rainy Apartment" }),
  ).toBeVisible();
  expect(audioRequests).toEqual([]);

  await expect(
    page.getByRole("slider", { name: "Rain", exact: true }),
  ).toHaveValue("65");
  await page.getByRole("slider", { name: "Rain", exact: true }).fill("72");
  await expect(
    page.getByRole("slider", { name: "Rain", exact: true }),
  ).toHaveValue("72");

  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();

  const playbackOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Rainy Apartment$/,
  });
  await expect(playbackOutcome).toBeVisible({ timeout: 15_000 });

  if ((await playbackOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    await expect(page.locator('p[role="alert"]')).toContainText(
      "Audio could not be loaded",
    );
    expect(runtimeErrors).toEqual([]);
    return;
  }

  await expect.poll(() => audioRequests.length).toBe(3);

  await page.getByRole("button", { name: "Pause Rainy Apartment" }).click();
  await expect(
    page.getByRole("button", { name: "Play Rainy Apartment" }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("audio failure is announced and retryable", async ({ page }) => {
  await page.route("**/audio/*.mp3", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/atmosphere/rainy-apartment");

  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText(
    "Audio could not be loaded",
    { timeout: 15_000 },
  );
  await expect(
    page.getByRole("button", { name: "Retry Rainy Apartment" }),
  ).toBeEnabled();
});

test("routes expose metadata, security headers and a useful 404", async ({
  page,
}) => {
  const response = await page.goto("/atmosphere/rainy-apartment");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  await expect(page).toHaveTitle("Rainy Apartment — ATMOS");

  const audioResponse = await page.request.get("/audio/rain.mp3");
  expect(audioResponse.status()).toBe(200);
  expect(audioResponse.headers()["content-type"]).toContain("audio/mpeg");
  expect(audioResponse.headers()["cache-control"]).toContain("max-age=86400");

  const notFoundResponse = await page.goto("/atmosphere/unknown");
  expect(notFoundResponse?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This atmosphere does not exist." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("keyboard order follows the visual reading order", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit uses Safari's system preference that excludes links from Tab order; covered on real Safari at Gate B.",
  );
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "ATMOS — Home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /Rainy Apartment/ }),
  ).toBeFocused();
  for (const name of ["Quiet Coffee Shop", "Deep Forest", "Fireplace"]) {
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: new RegExp(name) }),
    ).toBeFocused();
  }
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("link", { name: /Rainy Apartment/ }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Rainy Apartment" }),
  ).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "ATMOS — Home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Atmospheres" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Back to atmospheres" }),
  ).toBeFocused();

  for (const name of ["Rain", "Window Rain", "Distant Thunder"]) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("slider", { name, exact: true })).toBeFocused();
  }

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Play Rainy Apartment" }),
  ).toBeFocused();
});

test("catalog previews and player navigation keep URLs and audio coherent", async ({
  page,
}) => {
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });

  await page.goto("/");
  const destinations = page.getByRole("navigation", { name: "Atmospheres" });
  await expect(destinations.getByRole("link")).toHaveCount(4);

  await destinations.getByRole("link", { name: /Deep Forest/ }).focus();
  await expect(page.locator('[data-atmosphere="deep-forest"]')).toBeVisible();
  expect(audioRequests).toEqual([]);

  await destinations.getByRole("link", { name: /Quiet Coffee Shop/ }).click();
  await expect(page).toHaveURL(/\/atmosphere\/quiet-coffee-shop$/);
  await expect(
    page.getByRole("heading", { name: "Quiet Coffee Shop" }),
  ).toBeVisible();
  expect(audioRequests).toEqual([]);

  const menuTrigger = page.getByRole("button", { name: "Atmospheres" });
  await menuTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Atmospheres" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", {
      name: "Quiet Coffee Shop, current atmosphere",
    }),
  ).toBeFocused();
  await expect(
    dialog.getByRole("link", {
      name: "Quiet Coffee Shop, current atmosphere",
    }),
  ).toHaveAttribute("aria-current", "page");
  await expectNoSeriousAccessibilityViolation(page);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuTrigger).toBeFocused();

  await menuTrigger.click();
  await dialog.getByRole("link", { name: /Deep Forest/ }).click();
  await expect(page).toHaveURL(/\/atmosphere\/deep-forest$/);
  await expect(
    page.getByRole("heading", { name: "Deep Forest" }),
  ).toBeVisible();
  expect(audioRequests).toEqual([]);

  await page.goBack();
  await expect(page).toHaveURL(/\/atmosphere\/quiet-coffee-shop$/);
});

test("responsive visual identities load the right asset and keep a fallback", async ({
  page,
}) => {
  await page.goto("/atmosphere/deep-forest");
  const visual = page.locator("[data-atmosphere-visual]");
  await expect(visual).toBeVisible();

  const loadedVisual = await visual.evaluate((image: HTMLImageElement) => ({
    currentSrc: image.currentSrc,
    naturalHeight: image.naturalHeight,
    naturalWidth: image.naturalWidth,
  }));
  const isMobile = (page.viewportSize()?.width ?? 1280) <= 768;

  expect(loadedVisual.currentSrc).toContain(
    isMobile ? "deep-forest-mobile.webp" : "deep-forest-desktop.webp",
  );
  expect(loadedVisual.naturalWidth).toBe(isMobile ? 640 : 1536);
  expect(loadedVisual.naturalHeight).toBe(isMobile ? 1024 : 864);

  await page.route("**/images/atmospheres/*.webp", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("link", { name: /Fireplace/ }).focus();
  const fallback = page
    .locator('[data-atmosphere="fireplace"]')
    .locator('div[aria-hidden="true"]')
    .first();

  await expect(fallback).toHaveCSS("background-image", /gradient/);
  await expect(page.getByRole("link", { name: /Fireplace/ })).toBeEnabled();
});

test("home and player have no serious automated accessibility violation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('[data-atmosphere="rainy-apartment"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expectNoSeriousAccessibilityViolation(page);

  await page.goto("/atmosphere/rainy-apartment");
  await expect(page.locator('[data-atmosphere="rainy-apartment"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expectNoSeriousAccessibilityViolation(page);
});

test("catalog and player remain usable at narrow width with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Atmospheres" }).getByRole("link"),
  ).toHaveCount(4);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await page.goto("/atmosphere/rainy-apartment");

  await expect(
    page.getByRole("heading", { name: "Rainy Apartment" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Play/ })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
