import { describe, expect, it } from "vitest";

import { atmospheres } from "../atmospheres";

import {
  getSoundByReference,
  getSoundReferenceKey,
  preferenceCatalogue,
  soundCatalogue,
} from "./index";

describe("sound catalogue", () => {
  it("derives the twelve licensed layers from the atmosphere registry", () => {
    expect(soundCatalogue).toHaveLength(12);
    expect(soundCatalogue).toEqual(
      atmospheres.flatMap((atmosphere) =>
        atmosphere.sounds.map((sound) => ({
          atmosphereId: atmosphere.id,
          atmosphereName: atmosphere.name,
          layerId: sound.id,
          sound,
        })),
      ),
    );
  });

  it("keeps every global sound reference unique and resolvable", () => {
    const keys = soundCatalogue.map(getSoundReferenceKey);
    expect(new Set(keys).size).toBe(keys.length);

    for (const entry of soundCatalogue) {
      expect(getSoundByReference(entry)).toBe(entry);
    }
  });

  it("returns undefined for an unknown reference", () => {
    expect(
      getSoundByReference({
        atmosphereId: "rainy-apartment",
        layerId: "unknown",
      }),
    ).toBeUndefined();
  });

  it("exposes the compact catalogue used by local validation", () => {
    expect(preferenceCatalogue).toEqual(
      atmospheres.map(({ id: atmosphereId, sounds }) => ({
        atmosphereId,
        soundLayerIds: sounds.map(({ id }) => id),
      })),
    );
  });
});
