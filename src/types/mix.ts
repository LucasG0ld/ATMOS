import type { AtmosphereId, SoundLayerId } from "./atmosphere";

export type SoundReference = {
  atmosphereId: AtmosphereId;
  layerId: SoundLayerId;
};

export type SavedMixLayer = {
  sound: SoundReference;
  volume: number;
};

export type SavedMix = {
  id: string;
  name: string;
  sceneAtmosphereId: AtmosphereId;
  layers: readonly SavedMixLayer[];
};

export type SavedMixDraft = Omit<SavedMix, "id">;
