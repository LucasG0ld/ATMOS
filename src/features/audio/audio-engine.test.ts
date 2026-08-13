import { describe, expect, it, vi } from "vitest";

import { rainyApartment } from "../../data/atmospheres/rainy-apartment";
import { deepForest } from "../../data/atmospheres/deep-forest";
import { fireplace } from "../../data/atmospheres/fireplace";
import { quietCoffeeShop } from "../../data/atmospheres/quiet-coffee-shop";

import { WebAudioEngine } from "./audio-engine";

function createAudioParam(initialValue = 0) {
  const parameter = {
    value: initialValue,
    cancelAndHoldAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    linearRampToValueAtTime: vi.fn((value: number) => {
      parameter.value = value;
      return parameter;
    }),
    setValueAtTime: vi.fn((value: number) => {
      parameter.value = value;
      return parameter;
    }),
  };

  return parameter;
}

function createFakeContext() {
  const gains: Array<{
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    gain: ReturnType<typeof createAudioParam>;
  }> = [];
  const sources: Array<{
    buffer: AudioBuffer | null;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    loop: boolean;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }> = [];
  const context = {
    currentTime: 4,
    destination: {},
    state: "suspended" as AudioContextState,
    close: vi.fn(async () => {
      context.state = "closed";
    }),
    createBufferSource: vi.fn(() => {
      const source = {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        loop: false,
        start: vi.fn(),
        stop: vi.fn(),
      };
      sources.push(source);
      return source;
    }),
    createGain: vi.fn(() => {
      const gain = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: createAudioParam(),
      };
      gains.push(gain);
      return gain;
    }),
    decodeAudioData: vi.fn(async () => ({ duration: 42 })),
    resume: vi.fn(async () => {
      context.state = "running";
    }),
    suspend: vi.fn(async () => {
      context.state = "suspended";
    }),
  };

  return {
    context: context as unknown as AudioContext,
    gains,
    sources,
    rawContext: context,
  };
}

function successfulResponse(): Response {
  return {
    arrayBuffer: vi.fn(async () => new ArrayBuffer(8)),
    ok: true,
    status: 200,
  } as unknown as Response;
}

describe("WebAudioEngine", () => {
  it("creates one context after the first load and shares concurrent loading", async () => {
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const fetchAudio = vi.fn(async () => successfulResponse());
    const engine = new WebAudioEngine({
      createContext,
      fetch: fetchAudio as typeof fetch,
    });

    expect(createContext).not.toHaveBeenCalled();

    const firstLoad = engine.load(rainyApartment.sounds);
    const secondLoad = engine.load(rainyApartment.sounds);
    expect(firstLoad).toBe(secondLoad);
    await firstLoad;

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fetchAudio).toHaveBeenCalledTimes(3);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(1);

    await engine.play();

    expect(fake.sources).toHaveLength(3);
    for (const source of fake.sources) {
      expect(source.loop).toBe(true);
      expect(source.start).toHaveBeenCalledTimes(1);
    }
  });

  it("clamps layer volume and uses short gain automation", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });

    engine.setLayerVolume("rain", 2);
    await engine.load(rainyApartment.sounds);
    expect(fake.gains[2].gain.value).toBe(1);

    engine.setLayerVolume("rain", -1);
    expect(fake.gains[2].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      0,
      4.05,
    );
  });

  it("keeps successful layers when one resource fails", async () => {
    const fake = createFakeContext();
    const fetchAudio = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("window-rain")) throw new Error("offline");
      return successfulResponse();
    });
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });

    await expect(engine.load(rainyApartment.sounds)).resolves.toEqual({
      unavailableLayerIds: ["window-rain"],
    });
    await engine.play();

    expect(fake.sources).toHaveLength(2);
  });

  it("adds and removes one live layer with short ramps and bounded sources", async () => {
    vi.useFakeTimers();
    const fake = createFakeContext();
    const fetchAudio = vi.fn(async () => successfulResponse());
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });
    const addedLayer = fireplace.sounds[0];

    await engine.load(rainyApartment.sounds);
    await engine.play();
    engine.setLayerVolume(addedLayer.id, 0.28);
    await expect(engine.addLayer(addedLayer)).resolves.toEqual({
      unavailableLayerIds: [],
    });

    expect(fetchAudio).toHaveBeenCalledTimes(4);
    expect(fake.sources).toHaveLength(4);
    expect(
      fake.gains.at(-1)?.gain.linearRampToValueAtTime,
    ).toHaveBeenCalledWith(0.28, 4.05);

    await engine.syncLayers(rainyApartment.sounds);
    await vi.advanceTimersByTimeAsync(50);
    expect(fake.sources.at(-1)?.stop).toHaveBeenCalledTimes(1);
    expect(
      fake.sources.filter(({ stop }) => stop.mock.calls.length === 0),
    ).toHaveLength(3);
    vi.useRealTimers();
  });

  it("keeps the live mix playing when one added layer fails", async () => {
    const fake = createFakeContext();
    const fetchAudio = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("fire.mp3")) throw new Error("offline");
      return successfulResponse();
    });
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    await expect(engine.addLayer(fireplace.sounds[0])).resolves.toEqual({
      unavailableLayerIds: ["fire"],
    });
    expect(fake.sources).toHaveLength(3);
    expect(fake.rawContext.close).not.toHaveBeenCalled();
  });

  it("shares a pending incremental layer request", async () => {
    const fake = createFakeContext();
    let releaseResponse!: () => void;
    const fetchAudio = vi.fn(async () => successfulResponse());
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    fetchAudio.mockClear();
    fetchAudio.mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });
      return successfulResponse();
    });

    const firstAddition = engine.addLayer(fireplace.sounds[0]);
    const secondAddition = engine.addLayer(fireplace.sounds[0]);
    expect(firstAddition).toBe(secondAddition);
    expect(fetchAudio).toHaveBeenCalledTimes(1);
    releaseResponse();
    await expect(firstAddition).resolves.toEqual({ unavailableLayerIds: [] });
  });

  it("rejects invalid live sets before creating audio resources", async () => {
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const engine = new WebAudioEngine({
      createContext,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });

    expect(() => engine.load([])).toThrow("between one and four");
    expect(() =>
      engine.load([
        ...rainyApartment.sounds,
        fireplace.sounds[0],
        fireplace.sounds[1],
      ]),
    ).toThrow("between one and four");
    expect(() =>
      engine.load([rainyApartment.sounds[0], rainyApartment.sounds[0]]),
    ).toThrow("duplicate");
    expect(createContext).not.toHaveBeenCalled();
  });

  it("returns to three live sources after ten incremental add-remove cycles", async () => {
    vi.useFakeTimers();
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const engine = new WebAudioEngine({
      createContext,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    const expanded = [...rainyApartment.sounds, fireplace.sounds[0]];

    await engine.load(rainyApartment.sounds);
    await engine.play();
    for (let index = 0; index < 10; index += 1) {
      await engine.syncLayers(expanded);
      await engine.syncLayers(rainyApartment.sounds);
      await vi.advanceTimersByTimeAsync(50);
    }

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(
      fake.sources.filter(({ stop }) => stop.mock.calls.length === 0),
    ).toHaveLength(3);
    expect(
      fake.sources.filter(({ stop }) => stop.mock.calls.length === 1),
    ).toHaveLength(10);
    vi.useRealTimers();
  });

  it("fails cleanly when a suspended audio context cannot resume", async () => {
    const fake = createFakeContext();
    fake.rawContext.resume.mockImplementation(() => new Promise(() => {}));
    const fetchAudio = vi.fn(async () => successfulResponse());
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
      resumeTimeoutMs: 1,
    });

    await expect(engine.load(rainyApartment.sounds)).rejects.toThrow(
      "Audio context could not be resumed",
    );
    expect(fetchAudio).not.toHaveBeenCalled();
    expect(fake.rawContext.close).toHaveBeenCalledTimes(1);
  });

  it("rebuilds a clean graph when every layer fails and the user retries", async () => {
    const first = createFakeContext();
    const second = createFakeContext();
    const createContext = vi
      .fn<() => AudioContext>()
      .mockReturnValueOnce(first.context)
      .mockReturnValueOnce(second.context);
    const fetchAudio = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(successfulResponse());
    const engine = new WebAudioEngine({
      createContext,
      fetch: fetchAudio as typeof fetch,
    });

    await expect(engine.load(rainyApartment.sounds)).rejects.toThrow(
      "No audio layer",
    );
    expect(first.rawContext.close).toHaveBeenCalledTimes(1);

    await expect(engine.load(rainyApartment.sounds)).resolves.toEqual({
      unavailableLayerIds: [],
    });
    expect(createContext).toHaveBeenCalledTimes(2);
  });

  it("keeps a hidden session playing when allowed and recovers platform suspension", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();

    await engine.setPageHidden(true);
    expect(fake.rawContext.suspend).not.toHaveBeenCalled();
    await engine.setPageHidden(false);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(1);

    fake.rawContext.state = "suspended";
    await engine.setPageHidden(false);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(2);

    engine.pause();
    await engine.setPageHidden(true);
    expect(fake.rawContext.suspend).not.toHaveBeenCalled();
    await engine.setPageHidden(false);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(2);

    const firstDestroy = engine.destroy();
    const secondDestroy = engine.destroy();
    expect(firstDestroy).toBe(secondDestroy);
    await firstDestroy;

    for (const source of fake.sources) {
      expect(source.stop).toHaveBeenCalledTimes(1);
      expect(source.disconnect).toHaveBeenCalledTimes(1);
    }
    expect(fake.rawContext.close).toHaveBeenCalledTimes(1);
  });

  it("uses master automation for timer fade and lets Play supersede it", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    const master = fake.gains[0].gain;

    expect(engine.fadeOutForTimer(5)).toBe(5_000);
    expect(master.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 9);

    await engine.play();
    expect(master.cancelAndHoldAtTime).toHaveBeenCalledWith(4);
    expect(master.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 4.35);
  });

  it("schedules a background-safe timer fade and reports only its remaining time", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    const master = fake.gains[0].gain;

    expect(engine.scheduleTimerFade(900, 5)).toBe(true);
    expect(master.setValueAtTime).toHaveBeenLastCalledWith(1, 904);
    expect(master.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 909);

    fake.rawContext.currentTime = 906;
    expect(engine.fadeOutForTimer(5)).toBe(3_000);
  });

  it("cancels scheduled timer automation on Pause", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    expect(engine.scheduleTimerFade(900, 5)).toBe(true);

    engine.pause();

    expect(engine.fadeOutForTimer(5)).toBe(0);
  });

  it("restores full volume when a scheduled timer is canceled during its fade", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    const master = fake.gains[0].gain;
    expect(engine.scheduleTimerFade(900, 5)).toBe(true);

    fake.rawContext.currentTime = 906;
    engine.cancelTimerFade();

    expect(master.cancelAndHoldAtTime).toHaveBeenLastCalledWith(906);
    expect(master.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 906.35);
    expect(engine.fadeOutForTimer(5)).toBe(5_000);
  });

  it("finishes a timer immediately when the audio context is suspended", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    fake.rawContext.state = "suspended";

    expect(engine.fadeOutForTimer(5)).toBe(0);
    await engine.setPageHidden(false);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(1);
  });

  it("crossfades two buses in one context and retires the outgoing sources", async () => {
    vi.useFakeTimers();
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const engine = new WebAudioEngine({
      createContext,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    await expect(engine.transition(deepForest.sounds)).resolves.toEqual({
      unavailableLayerIds: [],
    });

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fake.sources).toHaveLength(6);
    expect(fake.gains[1].gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      5.8,
    );
    expect(fake.gains[5].gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      5.8,
    );

    await vi.advanceTimersByTimeAsync(1_800);
    expect(
      fake.sources
        .slice(0, 3)
        .every(({ stop }) => stop.mock.calls.length === 1),
    ).toBe(true);
    expect(
      fake.sources.slice(3).every(({ stop }) => stop.mock.calls.length === 0),
    ).toBe(true);
    vi.useRealTimers();
  });

  it("cancels a slow obsolete target and keeps at most two live buses", async () => {
    vi.useFakeTimers();
    const fake = createFakeContext();
    const fetchAudio = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("forest")) {
          return await new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          });
        }
        return successfulResponse();
      },
    );
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    const obsolete = engine.transition(deepForest.sounds);
    await Promise.resolve();
    const latest = engine.transition(fireplace.sounds);

    await expect(obsolete).rejects.toMatchObject({ name: "AbortError" });
    await expect(latest).resolves.toEqual({ unavailableLayerIds: [] });
    const liveSources = fake.sources.filter(
      ({ stop }) => stop.mock.calls.length === 0,
    );
    expect(liveSources).toHaveLength(6);
    vi.useRealTimers();
  });

  it("crossfades with the remaining target layers after a partial failure", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes("moving-leaves")) {
          throw new Error("offline");
        }
        return successfulResponse();
      }) as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    await expect(engine.transition(deepForest.sounds)).resolves.toEqual({
      unavailableLayerIds: ["moving-leaves"],
    });
    expect(fake.sources).toHaveLength(5);
  });

  it("preloads compressed audio without a context and reuses it on transition", async () => {
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const fetchAudio = vi.fn(async () => successfulResponse());
    const preloadOnlyEngine = new WebAudioEngine({
      createContext,
      fetch: fetchAudio as typeof fetch,
    });

    await preloadOnlyEngine.preload(deepForest.sounds);
    expect(createContext).not.toHaveBeenCalled();
    expect(fake.rawContext.decodeAudioData).not.toHaveBeenCalled();
    expect(fetchAudio).toHaveBeenCalledTimes(3);
    preloadOnlyEngine.cancelPreload();
    fetchAudio.mockClear();

    const engine = new WebAudioEngine({
      createContext,
      fetch: fetchAudio as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();
    await engine.preload(deepForest.sounds);
    expect(fake.rawContext.decodeAudioData).toHaveBeenCalledTimes(3);
    await engine.transition(deepForest.sounds);
    expect(fetchAudio).toHaveBeenCalledTimes(6);
    expect(fake.rawContext.decodeAudioData).toHaveBeenCalledTimes(6);
  });

  it("cancels an obsolete compressed preload before retaining the latest target", async () => {
    const fake = createFakeContext();
    const fetchAudio = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("forest")) {
          return await new Promise<Response>((_, reject) => {
            if (init?.signal?.aborted) {
              reject(new DOMException("aborted", "AbortError"));
              return;
            }
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          });
        }
        return successfulResponse();
      },
    );
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: fetchAudio as typeof fetch,
    });

    await engine.load(rainyApartment.sounds);
    await engine.play();
    const obsolete = engine.preload(deepForest.sounds);
    const latest = engine.preload(fireplace.sounds);
    await expect(obsolete).rejects.toMatchObject({ name: "AbortError" });
    await expect(latest).resolves.toBeUndefined();

    const requestsBeforeTransition = fetchAudio.mock.calls.length;
    await engine.transition(fireplace.sounds);
    expect(fetchAudio).toHaveBeenCalledTimes(requestsBeforeTransition);
  });

  it("returns to one live bus after ten consecutive transitions", async () => {
    vi.useFakeTimers();
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const engine = new WebAudioEngine({
      createContext,
      crossfadeSeconds: 0.001,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    const targets = [deepForest, fireplace, quietCoffeeShop, rainyApartment];

    await engine.load(rainyApartment.sounds);
    await engine.play();
    for (let index = 0; index < 10; index += 1) {
      await engine.transition(targets[index % targets.length].sounds);
      await vi.advanceTimersByTimeAsync(1);
    }

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(
      fake.sources.filter(({ stop }) => stop.mock.calls.length === 0),
    ).toHaveLength(3);
    expect(
      fake.sources.filter(({ stop }) => stop.mock.calls.length === 1),
    ).toHaveLength(30);
    vi.useRealTimers();
  });
});
