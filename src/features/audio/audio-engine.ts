import type { SoundLayer } from "../../types/atmosphere";

const LAYER_RAMP_SECONDS = 0.05;
const MASTER_RAMP_SECONDS = 0.35;
const CROSSFADE_SECONDS = 1.8;
const TRANSITION_SETTLE_MS = 80;
const RESUME_TIMEOUT_MS = 5_000;

export type AudioLoadResult = {
  unavailableLayerIds: readonly string[];
};

export type AudioEngineController = {
  load(layers: readonly SoundLayer[]): Promise<AudioLoadResult>;
  preload(layers: readonly SoundLayer[]): Promise<void>;
  cancelPreload(): void;
  transition(layers: readonly SoundLayer[]): Promise<AudioLoadResult>;
  play(): Promise<void>;
  pause(): void;
  setLayerVolume(layerId: string, volume: number): void;
  setPageHidden(hidden: boolean): Promise<void>;
  destroy(): Promise<void>;
};

type AudioEngineDependencies = {
  createContext: () => AudioContext;
  fetch: typeof globalThis.fetch;
  resumeTimeoutMs?: number;
  crossfadeSeconds?: number;
};

type AudioBus = {
  buffers: Map<string, AudioBuffer>;
  gain: GainNode;
  layerGains: Map<string, GainNode>;
  sources: Map<string, AudioBufferSourceNode>;
};

type CompressedAudio = {
  buffers: Map<string, ArrayBuffer>;
  key: string;
};

type PendingPreload = {
  abortController: AbortController;
  key: string;
  promise: Promise<CompressedAudio>;
};

function layersKey(layers: readonly SoundLayer[]): string {
  return layers.map(({ src }) => src).join("\u0000");
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function rampGain(
  parameter: AudioParam,
  value: number,
  currentTime: number,
  duration: number,
) {
  if (typeof parameter.cancelAndHoldAtTime === "function") {
    parameter.cancelAndHoldAtTime(currentTime);
  } else {
    parameter.cancelScheduledValues(currentTime);
    parameter.setValueAtTime(parameter.value, currentTime);
  }
  parameter.linearRampToValueAtTime(value, currentTime + duration);
}

function abortError(): Error {
  return new DOMException("Audio transition was superseded.", "AbortError");
}

export class WebAudioEngine implements AudioEngineController {
  private activeBus?: AudioBus;
  private context?: AudioContext;
  private compressedPreload?: CompressedAudio;
  private destroyPromise?: Promise<void>;
  private destroyed = false;
  private layerVolumes = new Map<string, number>();
  private loadAbortController?: AbortController;
  private loadPromise?: Promise<AudioLoadResult>;
  private masterGain?: GainNode;
  private operationId = 0;
  private playing = false;
  private pendingPreload?: PendingPreload;
  private retiringBus?: AudioBus;
  private retiringTimer?: ReturnType<typeof setTimeout>;
  private transitionAbortController?: AbortController;

  constructor(private readonly dependencies: AudioEngineDependencies) {}

  load(layers: readonly SoundLayer[]): Promise<AudioLoadResult> {
    this.assertAvailable();
    if (this.loadPromise) return this.loadPromise;
    if (this.activeBus) {
      return Promise.resolve({ unavailableLayerIds: [] });
    }

    const operation = ++this.operationId;
    const abortController = new AbortController();
    this.loadAbortController = abortController;
    this.loadPromise = this.loadInitialBus(
      layers,
      operation,
      abortController,
    ).catch(async (error) => {
      this.loadPromise = undefined;
      await this.resetGraph();
      throw error;
    });

    return this.loadPromise;
  }

  preload(layers: readonly SoundLayer[]): Promise<void> {
    this.assertAvailable();
    const key = layersKey(layers);
    if (this.compressedPreload?.key === key) return Promise.resolve();
    if (this.pendingPreload?.key === key) {
      return this.pendingPreload.promise.then(() => undefined);
    }

    this.cancelPreload();
    const abortController = new AbortController();
    const promise = this.fetchCompressedLayers(layers, abortController.signal);
    const pending: PendingPreload = { abortController, key, promise };
    this.pendingPreload = pending;

    return promise
      .then((preload) => {
        if (
          this.pendingPreload === pending &&
          !abortController.signal.aborted
        ) {
          this.compressedPreload = preload;
          this.pendingPreload = undefined;
        }
      })
      .catch((error: unknown) => {
        if (this.pendingPreload === pending) this.pendingPreload = undefined;
        throw error;
      });
  }

  cancelPreload(): void {
    this.pendingPreload?.abortController.abort();
    this.pendingPreload = undefined;
    this.compressedPreload = undefined;
  }

  async transition(layers: readonly SoundLayer[]): Promise<AudioLoadResult> {
    this.assertAvailable();
    if (!this.activeBus) return this.load(layers);

    const operation = ++this.operationId;
    this.transitionAbortController?.abort();
    const abortController = new AbortController();
    this.transitionAbortController = abortController;

    await this.settlePreviousTransition(operation);
    this.assertCurrentOperation(operation, abortController.signal);

    const { bus, result } = await this.createBus(
      layers,
      0,
      abortController.signal,
    );

    try {
      this.assertCurrentOperation(operation, abortController.signal);
    } catch (error) {
      this.disposeBus(bus);
      throw error;
    }

    const context = this.context!;
    const outgoingBus = this.activeBus;
    this.startBus(bus);
    this.activeBus = bus;
    this.retiringBus = outgoingBus;

    const duration = this.dependencies.crossfadeSeconds ?? CROSSFADE_SECONDS;
    rampGain(outgoingBus.gain.gain, 0, context.currentTime, duration);
    rampGain(bus.gain.gain, 1, context.currentTime, duration);
    this.scheduleRetiringBusCleanup(outgoingBus, duration * 1_000);
    return result;
  }

  async play(): Promise<void> {
    this.assertAvailable();
    if (!this.context || !this.masterGain || !this.activeBus) {
      throw new Error("Audio must be loaded before playback.");
    }

    await this.resumeContext();
    if (this.activeBus.sources.size === 0) this.startBus(this.activeBus);

    rampGain(
      this.masterGain.gain,
      1,
      this.context.currentTime,
      MASTER_RAMP_SECONDS,
    );
    this.playing = true;
  }

  pause(): void {
    if (!this.context || !this.masterGain || !this.playing) return;

    rampGain(
      this.masterGain.gain,
      0,
      this.context.currentTime,
      MASTER_RAMP_SECONDS,
    );
    this.playing = false;
  }

  setLayerVolume(layerId: string, volume: number): void {
    const normalizedVolume = clampVolume(volume);
    this.layerVolumes.set(layerId, normalizedVolume);
    if (!this.context) return;

    for (const bus of [this.activeBus, this.retiringBus]) {
      const gain = bus?.layerGains.get(layerId);
      if (gain) {
        rampGain(
          gain.gain,
          normalizedVolume,
          this.context.currentTime,
          LAYER_RAMP_SECONDS,
        );
      }
    }
  }

  async setPageHidden(hidden: boolean): Promise<void> {
    if (!this.context || !this.masterGain) return;

    if (hidden) {
      const currentTime = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(currentTime);
      this.masterGain.gain.setValueAtTime(0, currentTime);
      if (this.context.state === "running") await this.context.suspend();
      return;
    }

    if (!this.playing) return;
    this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
    await this.resumeContext();
    rampGain(
      this.masterGain.gain,
      1,
      this.context.currentTime,
      MASTER_RAMP_SECONDS,
    );
  }

  destroy(): Promise<void> {
    if (this.destroyPromise) return this.destroyPromise;
    this.destroyed = true;
    this.operationId += 1;
    this.destroyPromise = this.resetGraph();
    return this.destroyPromise;
  }

  private assertAvailable() {
    if (this.destroyed) throw new Error("Audio engine has been destroyed.");
  }

  private assertCurrentOperation(operation: number, signal: AbortSignal) {
    this.assertAvailable();
    if (signal.aborted || operation !== this.operationId) throw abortError();
  }

  private ensureContext(): AudioContext {
    if (this.context) return this.context;

    this.context = this.dependencies.createContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.context.destination);
    return this.context;
  }

  private async loadInitialBus(
    layers: readonly SoundLayer[],
    operation: number,
    abortController: AbortController,
  ): Promise<AudioLoadResult> {
    this.ensureContext();
    await this.resumeContext();
    const { bus, result } = await this.createBus(
      layers,
      1,
      abortController.signal,
    );
    this.assertCurrentOperation(operation, abortController.signal);
    this.activeBus = bus;
    return result;
  }

  private async createBus(
    layers: readonly SoundLayer[],
    initialGain: number,
    signal: AbortSignal,
  ): Promise<{ bus: AudioBus; result: AudioLoadResult }> {
    const context = this.ensureContext();
    const compressedLayers = await this.takeCompressedPreload(layers, signal);
    if (signal.aborted) throw abortError();
    const results = await Promise.allSettled(
      layers.map(async (layer) => {
        let encodedAudio = compressedLayers.get(layer.src);
        if (!encodedAudio) {
          const response = await this.dependencies.fetch(layer.src, { signal });
          if (!response.ok) {
            throw new Error(
              `Unable to load ${layer.id}: HTTP ${response.status}`,
            );
          }
          encodedAudio = await response.arrayBuffer();
        }

        const buffer = await context.decodeAudioData(encodedAudio.slice(0));
        return { buffer, layer };
      }),
    );

    if (signal.aborted) throw abortError();
    const unavailableLayerIds: string[] = [];
    const decodedLayers: Array<{ buffer: AudioBuffer; layer: SoundLayer }> = [];

    for (const [index, result] of results.entries()) {
      const layer = layers[index];
      if (result.status === "rejected") {
        unavailableLayerIds.push(layer.id);
      } else {
        decodedLayers.push(result.value);
      }
    }

    if (decodedLayers.length === 0) {
      throw new Error("No audio layer could be loaded. Please try again.");
    }

    const busGain = context.createGain();
    busGain.gain.value = initialGain;
    busGain.connect(this.masterGain!);
    const bus: AudioBus = {
      buffers: new Map(),
      gain: busGain,
      layerGains: new Map(),
      sources: new Map(),
    };

    for (const { buffer, layer } of decodedLayers) {
      bus.buffers.set(layer.id, buffer);
      const gain = context.createGain();
      gain.gain.value = this.layerVolumes.get(layer.id) ?? layer.defaultVolume;
      gain.connect(busGain);
      bus.layerGains.set(layer.id, gain);
    }

    return { bus, result: { unavailableLayerIds } };
  }

  private async fetchCompressedLayers(
    layers: readonly SoundLayer[],
    signal: AbortSignal,
  ): Promise<CompressedAudio> {
    const results = await Promise.allSettled(
      layers.map(async (layer) => {
        const response = await this.dependencies.fetch(layer.src, { signal });
        if (!response.ok) {
          throw new Error(
            `Unable to preload ${layer.id}: HTTP ${response.status}`,
          );
        }
        return [layer.src, await response.arrayBuffer()] as const;
      }),
    );
    if (signal.aborted) throw abortError();

    const buffers = new Map<string, ArrayBuffer>();
    for (const result of results) {
      if (result.status === "fulfilled") buffers.set(...result.value);
    }
    if (buffers.size === 0) {
      throw new Error("No audio layer could be preloaded.");
    }
    return { buffers, key: layersKey(layers) };
  }

  private async takeCompressedPreload(
    layers: readonly SoundLayer[],
    signal: AbortSignal,
  ): Promise<Map<string, ArrayBuffer>> {
    const key = layersKey(layers);
    const pending = this.pendingPreload;
    if (pending?.key === key) {
      await Promise.race([
        pending.promise,
        new Promise<never>((_, reject) => {
          signal.addEventListener("abort", () => reject(abortError()), {
            once: true,
          });
        }),
      ]);
    } else if (pending) {
      this.cancelPreload();
    }

    if (signal.aborted) throw abortError();
    if (this.compressedPreload?.key !== key) {
      if (this.compressedPreload) this.compressedPreload = undefined;
      return new Map();
    }

    const buffers = this.compressedPreload.buffers;
    this.compressedPreload = undefined;
    return buffers;
  }

  private async resumeContext() {
    const context = this.context;
    if (context?.state !== "suspended") return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        context.resume(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Audio context could not be resumed.")),
            this.dependencies.resumeTimeoutMs ?? RESUME_TIMEOUT_MS,
          );
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private startBus(bus: AudioBus) {
    if (!this.context || bus.sources.size > 0) return;

    for (const [layerId, buffer] of bus.buffers) {
      const gain = bus.layerGains.get(layerId);
      if (!gain) continue;

      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      bus.sources.set(layerId, source);
    }
  }

  private async settlePreviousTransition(operation: number) {
    const retiringBus = this.retiringBus;
    if (!retiringBus || !this.context || !this.activeBus) return;

    if (this.retiringTimer) clearTimeout(this.retiringTimer);
    this.retiringTimer = undefined;
    rampGain(
      retiringBus.gain.gain,
      0,
      this.context.currentTime,
      TRANSITION_SETTLE_MS / 1_000,
    );
    rampGain(
      this.activeBus.gain.gain,
      1,
      this.context.currentTime,
      TRANSITION_SETTLE_MS / 1_000,
    );
    await new Promise((resolve) => setTimeout(resolve, TRANSITION_SETTLE_MS));
    if (operation !== this.operationId) throw abortError();
    this.disposeBus(retiringBus);
    if (this.retiringBus === retiringBus) this.retiringBus = undefined;
  }

  private scheduleRetiringBusCleanup(bus: AudioBus, delayMs: number) {
    if (this.retiringTimer) clearTimeout(this.retiringTimer);
    this.retiringTimer = setTimeout(() => {
      this.disposeBus(bus);
      if (this.retiringBus === bus) this.retiringBus = undefined;
      this.retiringTimer = undefined;
    }, delayMs);
  }

  private disposeBus(bus: AudioBus) {
    for (const source of bus.sources.values()) {
      try {
        source.stop();
      } catch {
        // A source may already be stopped during idempotent cleanup.
      }
      source.disconnect();
    }
    bus.sources.clear();
    for (const gain of bus.layerGains.values()) gain.disconnect();
    bus.layerGains.clear();
    bus.buffers.clear();
    bus.gain.disconnect();
  }

  private async resetGraph() {
    this.cancelPreload();
    this.loadAbortController?.abort();
    this.transitionAbortController?.abort();
    this.loadAbortController = undefined;
    this.transitionAbortController = undefined;
    if (this.retiringTimer) clearTimeout(this.retiringTimer);
    this.retiringTimer = undefined;

    const buses = new Set([this.activeBus, this.retiringBus]);
    for (const bus of buses) if (bus) this.disposeBus(bus);
    this.activeBus = undefined;
    this.retiringBus = undefined;

    this.masterGain?.disconnect();
    this.masterGain = undefined;
    this.playing = false;
    this.loadPromise = undefined;

    const context = this.context;
    this.context = undefined;
    if (context && context.state !== "closed") await context.close();
  }
}

export function createAudioEngine(): AudioEngineController {
  return new WebAudioEngine({
    createContext: () => new AudioContext(),
    fetch: globalThis.fetch.bind(globalThis),
  });
}
