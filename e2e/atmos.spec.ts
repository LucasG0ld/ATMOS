import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { PREFERENCES_STORAGE_KEY } from "../src/features/preferences/preferences-storage";

function usesExpectedAudioFallback(browserName: string) {
  return (
    browserName === "webkit" ||
    (browserName === "firefox" && process.platform === "linux")
  );
}

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

test("invalid local preferences stay isolated from the existing experience", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });
  await page.addInitScript((storageKey) => {
    if (localStorage.getItem(storageKey) === null) {
      localStorage.setItem(storageKey, "{not-json");
    }
  }, PREFERENCES_STORAGE_KEY);

  await page.goto("/atmosphere/rainy-apartment");
  await expect(
    page.getByRole("heading", { name: "Rainy Apartment" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Rain", exact: true }),
  ).toHaveValue("65");
  expect(
    await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      PREFERENCES_STORAGE_KEY,
    ),
  ).toBe("{not-json");

  const unknownVersion = JSON.stringify({
    version: 99,
    favoriteAtmosphereIds: ["rainy-apartment"],
    layerVolumes: {},
  });
  await page.evaluate(
    ([storageKey, value]) => localStorage.setItem(storageKey, value),
    [PREFERENCES_STORAGE_KEY, unknownVersion],
  );
  await page.reload();

  await expect(
    page.getByRole("slider", { name: "Rain", exact: true }),
  ).toHaveValue("65");
  expect(
    await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      PREFERENCES_STORAGE_KEY,
    ),
  ).toBe(unknownVersion);
  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test("V1 preferences migrate to V2 without starting audio", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        favoriteAtmosphereIds: ["rainy-apartment"],
        layerVolumes: { "rainy-apartment": { rain: 0.44 } },
      }),
    );
  }, PREFERENCES_STORAGE_KEY);

  await page.goto("/atmosphere/rainy-apartment");
  await expect(
    page.getByRole("slider", { name: "Rain", exact: true }),
  ).toHaveValue("44");
  await expect(
    page.getByRole("button", { name: "Remove from favorites" }),
  ).toHaveAttribute("aria-pressed", "true");

  expect(
    await page.evaluate((storageKey) => {
      const serialized = localStorage.getItem(storageKey);
      return serialized ? JSON.parse(serialized) : null;
    }, PREFERENCES_STORAGE_KEY),
  ).toEqual({
    version: 2,
    favoriteAtmosphereIds: ["rainy-apartment"],
    layerVolumes: { "rainy-apartment": { rain: 0.44 } },
    savedMixes: [],
  });
  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test("favorites and volumes persist locally and reset to catalogue defaults", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.goto("/atmosphere/rainy-apartment");

  const rain = page.getByRole("slider", { name: "Rain", exact: true });
  await rain.fill("72");
  const addFavorite = page.getByRole("button", {
    name: "Add to favorites",
  });
  await addFavorite.click();
  await expect(
    page.getByRole("button", {
      name: "Remove from favorites",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate((storageKey) => {
        const value = localStorage.getItem(storageKey);
        if (!value) return false;
        const snapshot = JSON.parse(value);
        return (
          snapshot.layerVolumes["rainy-apartment"]?.rain === 0.72 &&
          snapshot.favoriteAtmosphereIds.includes("rainy-apartment")
        );
      }, PREFERENCES_STORAGE_KEY),
    )
    .toBe(true);

  await page.reload();
  await expect(rain).toHaveValue("72");
  await expect(
    page.getByRole("button", {
      name: "Remove from favorites",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Back to atmospheres" }).click();
  const rainyLink = page.locator('[data-atmosphere-link="rainy-apartment"]');
  await expect(rainyLink).toBeVisible();
  await expect(rainyLink.getByText("Saved")).toBeVisible();

  const preferencesTrigger = page.getByRole("button", { name: "Preferences" });
  await preferencesTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Preferences" });
  await expect(dialog).toBeVisible();
  await expectNoSeriousAccessibilityViolation(page);
  await dialog.getByRole("button", { name: "Reset saved preferences" }).click();
  const resetDialog = page.getByRole("dialog", {
    name: "Reset saved preferences?",
  });
  await expect(resetDialog).toContainText("all mixes from this device");
  await resetDialog.getByRole("button", { name: "Reset everything" }).click();
  await expect(dialog.getByText("Saved preferences reset.")).toBeVisible();
  await expect(dialog.getByText("Nothing saved yet")).toBeVisible();
  expect(
    await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      PREFERENCES_STORAGE_KEY,
    ),
  ).toBeNull();

  await dialog.getByRole("button", { name: "Close preferences" }).click();
  await expect(preferencesTrigger).toBeFocused();
  await expect(rainyLink.getByText("Saved")).toBeHidden();
  await rainyLink.click();
  await expect(rain).toHaveValue("65");
  expect(runtimeErrors).toEqual([]);
});

test("session timer starts, replaces, survives navigation and cancels locally", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });
  await page.goto("/atmosphere/rainy-apartment");

  const timerTrigger = page.getByRole("button", { name: "Timer" });
  await timerTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Set a timer" });
  await expect(dialog).toBeVisible();
  for (const duration of [15, 30, 45, 60, 90]) {
    await expect(
      dialog.getByRole("button", { name: `${duration} minutes` }),
    ).toBeVisible();
  }
  await expectNoSeriousAccessibilityViolation(page);

  await dialog.getByRole("button", { name: "15 minutes" }).click();
  await expect(
    page.getByRole("button", { name: /Timer · 1[45]:/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Timer ·/ })).toBeFocused();
  expect(audioRequests).toEqual([]);

  await page.getByRole("button", { name: /Timer ·/ }).click();
  await expect(dialog.getByText(/Ends in 1[45]:/)).toBeVisible();
  await dialog.getByRole("button", { name: "30 minutes" }).click();
  await expect(
    page.getByRole("button", { name: /Timer · (29|30):/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Atmospheres" }).click();
  await page
    .getByRole("dialog", { name: "Atmospheres" })
    .getByRole("link", { name: /Deep Forest/ })
    .click();
  await expect(page).toHaveURL(/\/atmosphere\/deep-forest$/);
  await expect(
    page.getByRole("button", { name: /Timer · (29|30):/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Timer ·/ }).click();
  await dialog.getByRole("button", { name: "Cancel timer" }).click();
  await expect(page.getByRole("button", { name: "Timer" })).toBeVisible();
  expect(audioRequests).toEqual([]);

  await page.getByRole("button", { name: "Timer" }).click();
  await dialog.getByRole("button", { name: "15 minutes" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Timer" })).toBeVisible();
  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test("an overdue wall-clock timer finishes without creating audio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const browserWindow = window as Window & {
      __atmosAudioContextCount?: number;
    };
    const OriginalAudioContext = window.AudioContext;
    browserWindow.__atmosAudioContextCount = 0;
    if (!OriginalAudioContext) return;
    window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, argumentsList) {
        browserWindow.__atmosAudioContextCount =
          (browserWindow.__atmosAudioContextCount ?? 0) + 1;
        return Reflect.construct(target, argumentsList);
      },
    });
  });
  await page.clock.install({ time: new Date("2026-08-11T12:00:00Z") });
  await page.goto("/atmosphere/rainy-apartment");

  await page.getByRole("button", { name: "Timer" }).click();
  await page
    .getByRole("dialog", { name: "Set a timer" })
    .getByRole("button", { name: "15 minutes" })
    .click();
  await page.clock.fastForward("15:00");

  await expect(page.locator('p[role="status"]')).toHaveText("Timer finished.");
  await expect(page.getByRole("button", { name: "Timer" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Rainy Apartment" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __atmosAudioContextCount?: number })
          .__atmosAudioContextCount,
    ),
  ).toBe(0);
});

test("Focus Mode keeps essentials, expires the timer and restores focus", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-08-11T12:00:00Z") });
  await page.goto("/atmosphere/rainy-apartment");

  await page.getByRole("button", { name: "Timer" }).click();
  await page
    .getByRole("dialog", { name: "Set a timer" })
    .getByRole("button", { name: "15 minutes" })
    .click();
  await page.getByRole("button", { name: "Focus", exact: true }).click();

  await expect(page.getByRole("button", { name: "Exit focus" })).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Rainy Apartment" }),
  ).toBeVisible();
  await expect(page.locator("time[data-ready='true']")).toBeVisible();
  await expect(page.getByRole("button", { name: /Timer ·/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Rainy Apartment" }),
  ).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Atmospheres" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Preferences" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /favorites/ })).toHaveCount(0);
  await expectNoSeriousAccessibilityViolation(page);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Timer ·/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Play Rainy Apartment" }),
  ).toBeFocused();

  await page.clock.fastForward("15:00");
  await expect(page.locator('p[role="status"]')).toHaveText("Timer finished.");
  await expect(page.getByRole("button", { name: "Timer" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Focus" })).toBeFocused();
  await expect(page.getByRole("slider")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Atmospheres" })).toBeVisible();
});

test("background playback is not voluntarily suspended", async ({
  browserName,
  page,
}) => {
  await page.addInitScript(() => {
    const browserWindow = window as Window & {
      __atmosSuspendCount?: number;
    };
    const OriginalAudioContext = window.AudioContext;
    browserWindow.__atmosSuspendCount = 0;
    if (!OriginalAudioContext) return;
    window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, argumentsList) {
        const context = Reflect.construct(
          target,
          argumentsList,
        ) as AudioContext;
        const suspend = context.suspend.bind(context);
        Object.defineProperty(context, "suspend", {
          configurable: true,
          value: () => {
            browserWindow.__atmosSuspendCount =
              (browserWindow.__atmosSuspendCount ?? 0) + 1;
            return suspend();
          },
        });
        return context;
      },
    });
  });
  await page.goto("/atmosphere/rainy-apartment");
  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();
  const playbackOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Rainy Apartment$/,
  });
  await expect(playbackOutcome).toBeVisible({ timeout: 15_000 });
  if ((await playbackOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    return;
  }

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Pause Rainy Apartment" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __atmosSuspendCount?: number })
          .__atmosSuspendCount,
    ),
  ).toBe(0);

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Pause Rainy Apartment" }),
  ).toBeVisible();
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

test("one unavailable layer keeps the remaining mix playable", async ({
  browserName,
  page,
}) => {
  test.skip(
    usesExpectedAudioFallback(browserName),
    "This Playwright browser cannot decode the MP3 layers on the current host.",
  );
  await page.route("**/audio/moving-leaves.mp3", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/atmosphere/deep-forest");

  await page.getByRole("button", { name: "Play Deep Forest" }).click();

  await expect(
    page.getByRole("button", { name: "Pause Deep Forest" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("status")).toContainText(
    "One sound layer is unavailable. Playback continues",
  );
  await expect(
    page.getByRole("slider", { name: "Moving Leaves" }),
  ).toBeDisabled();
  await expect(page.getByRole("slider", { name: "Forest Air" })).toBeEnabled();
  await expect(
    page.getByRole("slider", { name: "Distant Stream" }),
  ).toBeEnabled();
});

test("routes expose metadata, security headers and a useful 404", async ({
  page,
}) => {
  const response = await page.goto("/atmosphere/rainy-apartment", {
    waitUntil: "domcontentloaded",
  });
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

  const notFoundResponse = await page.goto("/atmosphere/unknown", {
    waitUntil: "domcontentloaded",
  });
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
  await expect(page.getByRole("button", { name: "Preferences" })).toBeFocused();
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
  await expect(page.getByRole("button", { name: "Preferences" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Back to atmospheres" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Create a mix" })).toBeFocused();

  for (const name of ["Rain", "Window Rain", "Distant Thunder"]) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("slider", { name, exact: true })).toBeFocused();
  }

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", {
      name: "Add to favorites",
    }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Timer" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeFocused();
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

  const deepForestDestination = destinations.getByRole("link", {
    name: /Deep Forest/,
  });
  await expect
    .poll(
      async () => {
        await deepForestDestination.blur();
        await deepForestDestination.focus();
        return page.locator('[data-atmosphere="deep-forest"]').count();
      },
      { timeout: 10_000 },
    )
    .toBe(1);
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

test("a new catalog mix stays deferred and loads its three layers after Play", async ({
  browserName,
  page,
}) => {
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) {
      audioRequests.push(new URL(request.url()).pathname);
    }
  });

  await page.goto("/atmosphere/deep-forest");
  await expect(page.getByRole("slider", { name: "Forest Air" })).toHaveValue(
    "58",
  );
  await expect(page.getByRole("slider", { name: "Moving Leaves" })).toHaveValue(
    "30",
  );
  await expect(
    page.getByRole("slider", { name: "Distant Stream" }),
  ).toHaveValue("18");
  expect(audioRequests).toEqual([]);

  await page.getByRole("button", { name: "Play Deep Forest" }).click();
  const playbackOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Deep Forest$/,
  });
  await expect(playbackOutcome).toBeVisible({ timeout: 15_000 });

  if ((await playbackOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    await expect(page.locator('p[role="alert"]')).toContainText(
      "Audio could not be loaded",
    );
    for (const path of [
      "/audio/distant-stream.mp3",
      "/audio/forest-air.mp3",
      "/audio/moving-leaves.mp3",
    ]) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("audio/mpeg");
    }
    return;
  }

  await expect.poll(() => audioRequests.length).toBe(3);
  expect(audioRequests.sort()).toEqual(
    [
      "/audio/distant-stream.mp3",
      "/audio/forest-air.mp3",
      "/audio/moving-leaves.mp3",
    ].sort(),
  );
});

test("a playing session survives atmosphere navigation with one audio context", async ({
  browserName,
  page,
}) => {
  await page.route("**/audio/*.mp3", async (route) => {
    if (
      ["forest-air", "moving-leaves", "distant-stream"].some((name) =>
        route.request().url().includes(name),
      )
    ) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    await route.continue().catch(() => undefined);
  });
  await page.addInitScript(() => {
    const browserWindow = window as Window & {
      __atmosAudioContextCount?: number;
    };
    const OriginalAudioContext = window.AudioContext;
    browserWindow.__atmosAudioContextCount = 0;
    if (!OriginalAudioContext) return;
    window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, argumentsList) {
        browserWindow.__atmosAudioContextCount =
          (browserWindow.__atmosAudioContextCount ?? 0) + 1;
        return Reflect.construct(target, argumentsList);
      },
    });
  });

  await page.goto("/atmosphere/rainy-apartment");
  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();
  const initialOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Rainy Apartment$/,
  });
  await expect(initialOutcome).toBeVisible({ timeout: 15_000 });
  if ((await initialOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    return;
  }

  await page.getByRole("button", { name: "Atmospheres" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Deep Forest/ })
    .click();
  await expect(page).toHaveURL(/\/atmosphere\/deep-forest$/);
  await expect(
    page.getByRole("heading", { name: "Deep Forest" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Atmospheres" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Fireplace/ })
    .click();
  await expect(page).toHaveURL(/\/atmosphere\/fireplace$/);
  await expect(
    page.getByRole("button", { name: "Pause Fireplace" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __atmosAudioContextCount?: number })
            .__atmosAudioContextCount,
      ),
    )
    .toBe(1);
});

test("audio preload starts only after Play, is reused, and respects Save-Data", async ({
  browserName,
  page,
}) => {
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) {
      audioRequests.push(new URL(request.url()).pathname);
    }
  });

  await page.goto("/atmosphere/rainy-apartment");
  await page.getByRole("button", { name: "Atmospheres" }).click();
  const initialDialog = page.getByRole("dialog", { name: "Atmospheres" });
  await initialDialog.getByRole("link", { name: /Deep Forest/ }).focus();
  expect(audioRequests).toEqual([]);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Play Rainy Apartment" }).click();
  const initialOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Rainy Apartment$/,
  });
  await expect(initialOutcome).toBeVisible({ timeout: 15_000 });
  if ((await initialOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    return;
  }
  await expect.poll(() => audioRequests.length).toBe(3);

  await page.getByRole("button", { name: "Atmospheres" }).click();
  const dialog = page.getByRole("dialog", { name: "Atmospheres" });
  const forestLink = dialog.getByRole("link", { name: /Deep Forest/ });
  await forestLink.focus();
  await expect
    .poll(
      () =>
        audioRequests.filter((path) =>
          ["forest-air", "moving-leaves", "distant-stream"].some((name) =>
            path.includes(name),
          ),
        ).length,
    )
    .toBe(3);
  await forestLink.click();
  await expect(
    page.getByRole("button", { name: "Pause Deep Forest" }),
  ).toBeVisible({ timeout: 15_000 });
  expect(
    audioRequests.filter((path) =>
      ["forest-air", "moving-leaves", "distant-stream"].some((name) =>
        path.includes(name),
      ),
    ),
  ).toHaveLength(3);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { downlink: 10, effectiveType: "4g", saveData: true },
    });
  });
  await page.getByRole("button", { name: "Atmospheres" }).click();
  await page
    .getByRole("dialog", { name: "Atmospheres" })
    .getByRole("link", { name: /Fireplace/ })
    .focus();
  await page.waitForTimeout(300);
  expect(
    audioRequests.filter((path) =>
      ["fire.mp3", "winter-wind", "quiet-room"].some((name) =>
        path.includes(name),
      ),
    ),
  ).toHaveLength(0);
});

test("responsive visual identities load the right asset and keep a fallback", async ({
  page,
}) => {
  await page.goto("/atmosphere/rainy-apartment");
  const visual = page.locator("[data-atmosphere-visual]");
  await expect(visual).toBeVisible();

  const loadedVisual = await visual.evaluate((image: HTMLImageElement) => ({
    currentSrc: image.currentSrc,
    naturalHeight: image.naturalHeight,
    naturalWidth: image.naturalWidth,
  }));
  const isMobile = (page.viewportSize()?.width ?? 1280) <= 768;

  expect(loadedVisual.currentSrc).toContain(
    isMobile ? "rainy-apartment-mobile.webp" : "rainy-apartment-desktop.webp",
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

  for (const slug of [
    "rainy-apartment",
    "quiet-coffee-shop",
    "deep-forest",
    "fireplace",
  ]) {
    await page.goto(`/atmosphere/${slug}`);
    await expect(page.locator(`[data-atmosphere="${slug}"]`)).toHaveCSS(
      "opacity",
      "1",
    );
    await expectNoSeriousAccessibilityViolation(page);
  }
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
  await page.getByRole("button", { name: "Focus", exact: true }).click();
  await expect(page.getByRole("button", { name: "Exit focus" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.goto("/compose?scene=rainy-apartment");
  await expect(
    page.getByRole("heading", { name: "Untitled mix" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("visual composer builds a four-sound draft without loading audio", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });

  await page.goto("/atmosphere/deep-forest");
  await page.getByRole("link", { name: "Create a mix" }).click();
  await expect(page).toHaveURL(/\/compose\?scene=deep-forest$/);
  await expect(
    page.getByRole("heading", { name: "Untitled mix" }),
  ).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(3);
  await expect(
    page.getByRole("slider", { name: "Forest Air from Deep Forest" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Untitled mix" }),
  ).toBeEnabled();
  await expect(page.getByRole("button", { name: "Save mix" })).toBeEnabled();

  await page.getByRole("button", { name: "Add sound" }).click();
  await page
    .getByRole("button", { name: "Add Rain from Rainy Apartment" })
    .click();
  await expect(page.getByRole("slider")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Mix full · 4 sounds" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Mix full · 4 sounds" }).click();
  await expect(page.getByText(/already has four sounds/i)).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Add Window Rain from Rainy Apartment",
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close sound library" }).click();
  await page.getByRole("button", { name: "Remove Rain" }).click();
  await expect(page.getByRole("slider")).toHaveCount(3);

  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  await expectNoSeriousAccessibilityViolation(page);
});

test("live composer changes one layer without loading the whole library", async ({
  browserName,
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) {
      audioRequests.push(new URL(request.url()).pathname);
    }
  });

  await page.goto("/compose?scene=deep-forest");
  expect(audioRequests).toEqual([]);
  await page.getByRole("button", { name: "Play Untitled mix" }).click();
  const playbackOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Untitled mix$/,
  });
  await expect(playbackOutcome).toBeVisible({ timeout: 15_000 });
  if ((await playbackOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    expect(runtimeErrors).toEqual([]);
    return;
  }

  await expect.poll(() => audioRequests.length).toBe(3);
  await page.getByRole("button", { name: "Add sound" }).click();
  await page.getByRole("button", { name: "Add Fire from Fireplace" }).click();
  await expect.poll(() => audioRequests.length).toBe(4);
  await expect(
    page.getByRole("button", { name: "Pause Untitled mix" }),
  ).toBeVisible();
  await page.getByRole("slider", { name: "Fire from Fireplace" }).fill("36");
  await page.getByRole("button", { name: "Remove Fire" }).click();
  await expect(page.getByRole("slider")).toHaveCount(3);
  expect(audioRequests).toHaveLength(4);

  await page.getByRole("button", { name: "Focus" }).click();
  await expect(page.getByRole("button", { name: "Exit focus" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pause Untitled mix" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Timer" })).toBeVisible();
  await page.getByRole("button", { name: "Exit focus" }).click();
  await page.getByRole("button", { name: "Pause Untitled mix" }).click();
  await expect(
    page.getByRole("button", { name: "Play Untitled mix" }),
  ).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});

test("one failed live addition leaves the custom mix playable", async ({
  browserName,
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.route("**/audio/fire.mp3", (route) => route.abort("failed"));
  await page.goto("/compose?scene=deep-forest");
  await page.getByRole("button", { name: "Play Untitled mix" }).click();
  const playbackOutcome = page.getByRole("button", {
    name: /^(Pause|Retry) Untitled mix$/,
  });
  await expect(playbackOutcome).toBeVisible({ timeout: 15_000 });
  if ((await playbackOutcome.getAttribute("aria-label"))?.startsWith("Retry")) {
    expect(usesExpectedAudioFallback(browserName)).toBe(true);
    expect(runtimeErrors).toEqual([]);
    return;
  }

  await page.getByRole("button", { name: "Add sound" }).click();
  await page.getByRole("button", { name: "Add Fire from Fireplace" }).click();
  await expect(page.getByRole("status")).toContainText(
    "One sound layer is unavailable",
  );
  await expect(
    page.getByRole("slider", { name: "Fire from Fireplace" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Pause Untitled mix" }),
  ).toBeVisible();
  expect(
    runtimeErrors.filter(
      (message) => !message.includes("Failed to load resource"),
    ),
  ).toEqual([]);
});

test("a local mix survives reload, updates by stable ID and deletes safely", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
  });

  await page.goto("/compose?scene=deep-forest");
  await page.getByRole("button", { name: "Save mix" }).click();
  const nameDialog = page.getByRole("dialog", { name: "Name your mix" });
  await expect(
    nameDialog.getByRole("textbox", { name: "Mix name" }),
  ).toBeFocused();
  await expectNoSeriousAccessibilityViolation(page);
  await nameDialog
    .getByRole("textbox", { name: "Mix name" })
    .fill("Forest rest");
  await nameDialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Forest rest" }),
  ).toBeVisible();
  await expect(page.getByText("Mix saved on this device.")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const value = localStorage.getItem("atmos.preferences");
        if (!value) return null;
        const parsed = JSON.parse(value) as {
          savedMixes?: Array<{ id: string; name: string }>;
        };
        return parsed.savedMixes?.[0] ?? null;
      }),
    )
    .toMatchObject({ name: "Forest rest" });
  const firstId = await page.evaluate(() => {
    const parsed = JSON.parse(localStorage.getItem("atmos.preferences")!) as {
      savedMixes: Array<{ id: string }>;
    };
    return parsed.savedMixes[0]!.id;
  });

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Untitled mix" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Your mixes" }).click();
  await page.getByRole("button", { name: "Open Forest rest" }).click();
  await expect(
    page.getByRole("heading", { name: "Forest rest" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Forest rest" }),
  ).toBeVisible();

  await page
    .getByRole("slider", { name: "Forest Air from Deep Forest" })
    .fill("31");
  await expect(
    page.getByText("Unsaved changes", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "Your mixes" }).click();
  await page.getByRole("button", { name: "Rename Forest rest" }).click();
  const renameDialog = page.getByRole("dialog", { name: "Rename mix" });
  await renameDialog
    .getByRole("textbox", { name: "Mix name" })
    .fill("Forest rest renamed");
  await renameDialog.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("heading", { name: "Forest rest renamed" }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const parsed = JSON.parse(
          localStorage.getItem("atmos.preferences")!,
        ) as {
          savedMixes: Array<{ id: string; name: string }>;
        };
        return parsed.savedMixes[0];
      }),
    )
    .toMatchObject({ id: firstId, name: "Forest rest renamed" });

  await page
    .getByRole("button", { name: "Delete Forest rest renamed" })
    .click();
  const deleteDialog = page.getByRole("dialog", {
    name: "Delete “Forest rest renamed”?",
  });
  await expect(deleteDialog).toContainText("No catalogue sounds are deleted.");
  await expectNoSeriousAccessibilityViolation(page);
  await deleteDialog.getByRole("button", { name: "Delete mix" }).click();
  await expect(
    page.getByRole("heading", { name: "Untitled mix" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Your mixes" })).toHaveCount(0);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const value = localStorage.getItem("atmos.preferences");
        if (!value) return -1;
        return (JSON.parse(value) as { savedMixes: unknown[] }).savedMixes
          .length;
      }),
    )
    .toBe(0);
  expect(audioRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  await expectNoSeriousAccessibilityViolation(page);
});
