import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, ".cache", "performance");
const port = 3117;
const origin = `http://127.0.0.1:${port}`;
const mixNames = ["Rain study", "Forest fire", "Quiet room", "Coffee rain"];

const preferences = {
  version: 2,
  favoriteAtmosphereIds: [],
  layerVolumes: {},
  savedMixes: [
    {
      id: "runtime-rain",
      name: mixNames[0],
      sceneAtmosphereId: "rainy-apartment",
      layers: [
        {
          sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
          volume: 0.65,
        },
        {
          sound: { atmosphereId: "rainy-apartment", layerId: "window-rain" },
          volume: 0.48,
        },
        {
          sound: {
            atmosphereId: "rainy-apartment",
            layerId: "distant-thunder",
          },
          volume: 0.28,
        },
      ],
    },
    {
      id: "runtime-forest",
      name: mixNames[1],
      sceneAtmosphereId: "deep-forest",
      layers: [
        {
          sound: { atmosphereId: "deep-forest", layerId: "forest-air" },
          volume: 0.58,
        },
        {
          sound: { atmosphereId: "deep-forest", layerId: "moving-leaves" },
          volume: 0.42,
        },
        { sound: { atmosphereId: "fireplace", layerId: "fire" }, volume: 0.36 },
        {
          sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
          volume: 0.22,
        },
      ],
    },
    {
      id: "runtime-room",
      name: mixNames[2],
      sceneAtmosphereId: "fireplace",
      layers: [
        { sound: { atmosphereId: "fireplace", layerId: "fire" }, volume: 0.7 },
        {
          sound: { atmosphereId: "fireplace", layerId: "quiet-room" },
          volume: 0.35,
        },
      ],
    },
    {
      id: "runtime-coffee",
      name: mixNames[3],
      sceneAtmosphereId: "quiet-coffee-shop",
      layers: [
        {
          sound: { atmosphereId: "quiet-coffee-shop", layerId: "cafe-room" },
          volume: 0.58,
        },
        {
          sound: { atmosphereId: "quiet-coffee-shop", layerId: "soft-clatter" },
          volume: 0.32,
        },
        {
          sound: { atmosphereId: "rainy-apartment", layerId: "window-rain" },
          volume: 0.25,
        },
      ],
    },
  ],
};

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
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
  await page.addInitScript((snapshot) => {
    localStorage.setItem("atmos.preferences", JSON.stringify(snapshot));
    const trackedListenerTypes = new Set([
      "beforeunload",
      "keydown",
      "pageshow",
      "visibilitychange",
    ]);
    const listenerRegistry = new Map();
    const addEventListener = EventTarget.prototype.addEventListener;
    const removeEventListener = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (listener && trackedListenerTypes.has(type)) {
        let listeners = listenerRegistry.get(this);
        if (!listeners) {
          listeners = new Map();
          listenerRegistry.set(this, listeners);
        }
        const callbacks = listeners.get(type) ?? new Set();
        callbacks.add(listener);
        listeners.set(type, callbacks);
      }
      return addEventListener.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      if (listener && trackedListenerTypes.has(type)) {
        listenerRegistry.get(this)?.get(type)?.delete(listener);
      }
      return removeEventListener.call(this, type, listener, options);
    };
    window.__atmosListenerCount = () =>
      Array.from(listenerRegistry.values()).reduce(
        (total, listeners) =>
          total +
          Array.from(listeners.values()).reduce(
            (subtotal, callbacks) => subtotal + callbacks.size,
            0,
          ),
        0,
      );
    const OriginalAudioContext = window.AudioContext;
    window.__atmosRuntime = {
      activeSources: 0,
      audioContextCount: 0,
      maximumActiveSources: 0,
    };
    window.AudioContext = new Proxy(OriginalAudioContext, {
      construct(target, argumentsList) {
        window.__atmosRuntime.audioContextCount += 1;
        const context = Reflect.construct(target, argumentsList);
        const createBufferSource = context.createBufferSource.bind(context);
        context.createBufferSource = () => {
          const source = createBufferSource();
          const start = source.start.bind(source);
          const stop = source.stop.bind(source);
          let active = false;
          source.start = (...args) => {
            if (!active) {
              active = true;
              window.__atmosRuntime.activeSources += 1;
              window.__atmosRuntime.maximumActiveSources = Math.max(
                window.__atmosRuntime.maximumActiveSources,
                window.__atmosRuntime.activeSources,
              );
            }
            return start(...args);
          };
          source.stop = (...args) => {
            if (active) {
              active = false;
              window.__atmosRuntime.activeSources -= 1;
            }
            return stop(...args);
          };
          return source;
        };
        return context;
      },
    });
  }, preferences);

  await page.goto(`${origin}/compose`);
  await page.getByRole("button", { name: "Your mixes" }).click();
  await page.getByRole("button", { name: `Open ${mixNames[0]}` }).click();
  await page.getByRole("button", { name: `Play ${mixNames[0]}` }).click();
  await page
    .getByRole("button", { name: `Pause ${mixNames[0]}` })
    .waitFor({ timeout: 15_000 });

  const client = await page.context().newCDPSession(page);
  await client.send("HeapProfiler.collectGarbage");
  const initialHeapBytes = await page.evaluate(
    () => performance.memory?.usedJSHeapSize ?? 0,
  );
  const initialListenerCount = await page.evaluate(() =>
    window.__atmosListenerCount(),
  );

  for (let index = 0; index < 10; index += 1) {
    const name = mixNames[(index + 1) % mixNames.length];
    await page.getByRole("button", { name: "Your mixes" }).click();
    await page.getByRole("button", { name: `Open ${name}` }).click();
    await page
      .getByRole("button", { name: `Pause ${name}` })
      .waitFor({ timeout: 15_000 });
    await page.waitForTimeout(1_900);
  }

  await client.send("HeapProfiler.collectGarbage");
  const finalHeapBytes = await page.evaluate(
    () => performance.memory?.usedJSHeapSize ?? 0,
  );
  const runtime = await page.evaluate(() => window.__atmosRuntime);
  const finalListenerCount = await page.evaluate(() =>
    window.__atmosListenerCount(),
  );
  const audioTransferBytes = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("/audio/"))
      .reduce((total, entry) => total + entry.transferSize, 0),
  );
  if (runtime.audioContextCount !== 1) {
    throw new Error(
      `Expected one AudioContext, received ${runtime.audioContextCount}.`,
    );
  }
  if (runtime.activeSources > 4 || runtime.maximumActiveSources > 8) {
    throw new Error(
      `Source budget exceeded: ${runtime.activeSources} stable / ${runtime.maximumActiveSources} transient.`,
    );
  }
  if (
    new Set(audioRequests).size > 12 ||
    audioTransferBytes > 12 * 1024 * 1024
  ) {
    throw new Error(
      `Audio cache budget exceeded: ${new Set(audioRequests).size} URLs / ${audioTransferBytes} bytes.`,
    );
  }
  if (finalListenerCount !== initialListenerCount) {
    throw new Error(
      `Listener count changed: ${initialListenerCount} initial / ${finalListenerCount} final.`,
    );
  }
  const heapDeltaBytes = finalHeapBytes - initialHeapBytes;
  if (heapDeltaBytes > 1_500_000) {
    throw new Error(
      `Heap growth exceeded the 1.5 MB stabilization ceiling: ${heapDeltaBytes} bytes.`,
    );
  }

  const summary = {
    mixChanges: 10,
    ...runtime,
    audioRequestCount: audioRequests.length,
    uniqueAudioRequestCount: new Set(audioRequests).size,
    audioTransferBytes,
    initialListenerCount,
    finalListenerCount,
    initialHeapBytes,
    finalHeapBytes,
    heapDeltaBytes,
  };
  await writeFile(
    resolve(outputDirectory, "composer-runtime-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  console.table([summary]);
} finally {
  await browser?.close();
  server.kill();
}
