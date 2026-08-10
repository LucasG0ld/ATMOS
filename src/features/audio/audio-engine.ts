import type { SoundLayer } from "../../types/atmosphere";

const LAYER_RAMP_SECONDS = 0.05;
const MASTER_RAMP_SECONDS = 0.35;
const RESUME_TIMEOUT_MS = 5_000;

export type AudioLoadResult = {
  unavailableLayerIds: readonly string[];
};

export type AudioEngineController = {
  load(layers: readonly SoundLayer[]): Promise<AudioLoadResult>;
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
};

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

export class WebAudioEngine implements AudioEngineController {
  private abortController?: AbortController;
  private buffers = new Map<string, AudioBuffer>();
  private context?: AudioContext;
  private destroyPromise?: Promise<void>;
  private destroyed = false;
  private layerGains = new Map<string, GainNode>();
  private layerVolumes = new Map<string, number>();
  private loadPromise?: Promise<AudioLoadResult>;
  private masterGain?: GainNode;
  private playing = false;
  private sources = new Map<string, AudioBufferSourceNode>();

  constructor(private readonly dependencies: AudioEngineDependencies) {}

  load(layers: readonly SoundLayer[]): Promise<AudioLoadResult> {
    this.assertAvailable();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loadLayers(layers).catch(async (error) => {
      this.loadPromise = undefined;
      await this.resetGraph();
      throw error;
    });

    return this.loadPromise;
  }

  async play(): Promise<void> {
    this.assertAvailable();
    if (!this.context || !this.masterGain || this.buffers.size === 0) {
      throw new Error("Audio must be loaded before playback.");
    }

    await this.resumeContext();
    if (this.sources.size === 0) this.startSources();

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

    const gain = this.layerGains.get(layerId);
    if (!gain || !this.context) return;

    rampGain(
      gain.gain,
      normalizedVolume,
      this.context.currentTime,
      LAYER_RAMP_SECONDS,
    );
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
    this.destroyPromise = this.resetGraph();
    return this.destroyPromise;
  }

  private assertAvailable() {
    if (this.destroyed) throw new Error("Audio engine has been destroyed.");
  }

  private ensureContext(): AudioContext {
    if (this.context) return this.context;

    this.context = this.dependencies.createContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.context.destination);
    return this.context;
  }

  private async loadLayers(
    layers: readonly SoundLayer[],
  ): Promise<AudioLoadResult> {
    const context = this.ensureContext();
    this.abortController = new AbortController();
    await this.resumeContext();

    const results = await Promise.allSettled(
      layers.map(async (layer) => {
        const response = await this.dependencies.fetch(layer.src, {
          signal: this.abortController?.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Unable to load ${layer.id}: HTTP ${response.status}`,
          );
        }

        const buffer = await context.decodeAudioData(
          await response.arrayBuffer(),
        );
        return { buffer, layer };
      }),
    );

    this.assertAvailable();
    const unavailableLayerIds: string[] = [];

    for (const [index, result] of results.entries()) {
      const layer = layers[index];
      if (result.status === "rejected") {
        unavailableLayerIds.push(layer.id);
        continue;
      }

      this.buffers.set(layer.id, result.value.buffer);
      const gain = context.createGain();
      gain.gain.value = this.layerVolumes.get(layer.id) ?? layer.defaultVolume;
      gain.connect(this.masterGain!);
      this.layerGains.set(layer.id, gain);
    }

    if (this.buffers.size === 0) {
      throw new Error("No audio layer could be loaded. Please try again.");
    }

    return { unavailableLayerIds };
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

  private startSources() {
    if (!this.context) return;

    for (const [layerId, buffer] of this.buffers) {
      const gain = this.layerGains.get(layerId);
      if (!gain) continue;

      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      this.sources.set(layerId, source);
    }
  }

  private async resetGraph() {
    this.abortController?.abort();
    this.abortController = undefined;

    for (const source of this.sources.values()) {
      try {
        source.stop();
      } catch {
        // A source may already be stopped during idempotent cleanup.
      }
      source.disconnect();
    }
    this.sources.clear();

    for (const gain of this.layerGains.values()) gain.disconnect();
    this.layerGains.clear();
    this.buffers.clear();

    this.masterGain?.disconnect();
    this.masterGain = undefined;
    this.playing = false;

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
