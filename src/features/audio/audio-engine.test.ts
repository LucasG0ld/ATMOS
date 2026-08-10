import { describe, expect, it, vi } from "vitest";

import { rainyApartment } from "../../data/atmospheres/rainy-apartment";

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
    expect(fake.gains[1].gain.value).toBe(1);

    engine.setLayerVolume("rain", -1);
    expect(fake.gains[1].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(
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

  it("suspends a hidden page and cleans every node idempotently", async () => {
    const fake = createFakeContext();
    const engine = new WebAudioEngine({
      createContext: () => fake.context,
      fetch: vi.fn(async () => successfulResponse()) as typeof fetch,
    });
    await engine.load(rainyApartment.sounds);
    await engine.play();

    await engine.setPageHidden(true);
    expect(fake.rawContext.suspend).toHaveBeenCalledTimes(1);
    await engine.setPageHidden(false);
    expect(fake.rawContext.resume).toHaveBeenCalledTimes(2);

    engine.pause();
    await engine.setPageHidden(true);
    expect(fake.rawContext.suspend).toHaveBeenCalledTimes(2);
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
});
