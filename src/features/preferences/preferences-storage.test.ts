import { describe, expect, it, vi } from "vitest";

import {
  createPreferencesStorageAdapter,
  PREFERENCES_MAX_SERIALIZED_LENGTH,
  PREFERENCES_STORAGE_KEY,
  validateStoredPreferences,
  type PreferenceCatalogueEntry,
  type PreferencesSnapshot,
} from "./preferences-storage";

const catalogue = [
  { atmosphereId: "rainy-apartment", soundLayerIds: ["rain", "thunder"] },
  { atmosphereId: "deep-forest", soundLayerIds: ["forest-air"] },
] as const satisfies readonly PreferenceCatalogueEntry[];

function createStorage(overrides: Partial<Storage> = {}): Storage {
  return {
    clear: vi.fn(),
    getItem: vi.fn().mockReturnValue(null),
    key: vi.fn().mockReturnValue(null),
    length: 0,
    removeItem: vi.fn(),
    setItem: vi.fn(),
    ...overrides,
  };
}

describe("preferences storage", () => {
  it("keeps only known unique IDs and valid layer volumes", () => {
    expect(
      validateStoredPreferences(
        {
          version: 1,
          favoriteAtmosphereIds: ["deep-forest", "unknown", "deep-forest", 12],
          layerVolumes: {
            "deep-forest": { "forest-air": 0.4, removed: 0.7 },
            "rainy-apartment": {
              rain: 0,
              thunder: 1.1,
            },
            unknown: { sound: 0.5 },
          },
        },
        catalogue,
      ),
    ).toEqual({
      favoriteAtmosphereIds: ["deep-forest"],
      layerVolumes: {
        "deep-forest": { "forest-air": 0.4 },
        "rainy-apartment": { rain: 0 },
      },
    });
  });

  it.each([
    null,
    [],
    { version: 2, favoriteAtmosphereIds: ["deep-forest"] },
    { version: 1, favoriteAtmosphereIds: "deep-forest" },
  ])("uses empty defaults for an unsupported value", (value) => {
    expect(validateStoredPreferences(value, catalogue)).toEqual({
      favoriteAtmosphereIds: [],
      layerVolumes: {},
    });
  });

  it("treats missing and corrupt JSON as an available empty store", () => {
    const missingStorage = createStorage();
    const corruptStorage = createStorage({
      getItem: vi.fn().mockReturnValue("{not-json"),
    });

    expect(
      createPreferencesStorageAdapter(catalogue, () => missingStorage).read(),
    ).toEqual({
      preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
      storageAvailable: true,
    });
    expect(
      createPreferencesStorageAdapter(catalogue, () => corruptStorage).read(),
    ).toEqual({
      preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
      storageAvailable: true,
    });
  });

  it("degrades safely when storage access is unavailable", () => {
    const throwingStorage = createStorage({
      getItem: vi.fn(() => {
        throw new DOMException("Blocked", "SecurityError");
      }),
      removeItem: vi.fn(() => {
        throw new DOMException("Blocked", "SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("Full", "QuotaExceededError");
      }),
    });
    const adapter = createPreferencesStorageAdapter(
      catalogue,
      () => throwingStorage,
    );

    expect(adapter.read()).toEqual({
      preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
      storageAvailable: false,
    });
    expect(adapter.write({ favoriteAtmosphereIds: [], layerVolumes: {} })).toBe(
      false,
    );
    expect(adapter.reset()).toBe(false);

    const blockedAdapter = createPreferencesStorageAdapter(catalogue, () => {
      throw new DOMException("Blocked", "SecurityError");
    });
    expect(blockedAdapter.read().storageAvailable).toBe(false);
  });

  it("writes one validated V1 snapshot and removes the single key", () => {
    const storage = createStorage();
    const adapter = createPreferencesStorageAdapter(catalogue, () => storage);
    const preferences: PreferencesSnapshot = {
      favoriteAtmosphereIds: ["rainy-apartment", "unknown"],
      layerVolumes: {
        "rainy-apartment": { rain: 0.25, removed: 0.8 },
      },
    };

    expect(adapter.write(preferences)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favoriteAtmosphereIds: ["rainy-apartment"],
        layerVolumes: { "rainy-apartment": { rain: 0.25 } },
      }),
    );

    expect(adapter.reset()).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(PREFERENCES_STORAGE_KEY);
  });

  it("rejects a serialized snapshot above the storage budget", () => {
    const soundLayerIds = Array.from(
      { length: PREFERENCES_MAX_SERIALIZED_LENGTH / 4 },
      (_, index) => `layer-${index}`,
    );
    const largeCatalogue = [
      { atmosphereId: "large", soundLayerIds },
    ] satisfies readonly PreferenceCatalogueEntry[];
    const storage = createStorage();
    const adapter = createPreferencesStorageAdapter(
      largeCatalogue,
      () => storage,
    );

    expect(
      adapter.write({
        favoriteAtmosphereIds: [],
        layerVolumes: {
          large: Object.fromEntries(soundLayerIds.map((id) => [id, 0.5])),
        },
      }),
    ).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();

    const oversizedStorage = createStorage({
      getItem: vi
        .fn()
        .mockReturnValue("x".repeat(PREFERENCES_MAX_SERIALIZED_LENGTH + 1)),
    });
    expect(
      createPreferencesStorageAdapter(catalogue, () => oversizedStorage).read(),
    ).toEqual({
      preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
      storageAvailable: true,
    });
  });
});
