import { describe, expect, it, vi } from "vitest";

import {
  createPreferencesStorageAdapter,
  MAX_MIX_LAYERS,
  MAX_MIX_NAME_LENGTH,
  MAX_SAVED_MIXES,
  migrateStoredPreferences,
  PREFERENCES_MAX_SERIALIZED_LENGTH,
  PREFERENCES_STORAGE_KEY,
  validateSavedMix,
  validateStoredPreferences,
  type PreferenceCatalogueEntry,
  type PreferencesSnapshot,
} from "./preferences-storage";

const catalogue = [
  {
    atmosphereId: "rainy-apartment",
    soundLayerIds: ["rain", "window-rain", "thunder"],
  },
  {
    atmosphereId: "deep-forest",
    soundLayerIds: ["forest-air", "birds", "stream"],
  },
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

function createStoredMix(id = "mix-1") {
  return {
    id,
    name: "  Rain and trees  ",
    sceneAtmosphereId: "rainy-apartment",
    layers: [
      {
        sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
        volume: 0.6,
      },
      {
        sound: { atmosphereId: "deep-forest", layerId: "birds" },
        volume: 0.3,
      },
    ],
  };
}

describe("preferences storage", () => {
  it("keeps only known unique IDs and valid layer volumes from V1", () => {
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
      savedMixes: [],
    });
  });

  it("validates, trims and repairs V2 mixes without duplicating sounds", () => {
    const storedMix = createStoredMix();
    storedMix.layers.push(
      storedMix.layers[0],
      {
        sound: { atmosphereId: "unknown", layerId: "sound" },
        volume: 0.5,
      },
      {
        sound: { atmosphereId: "deep-forest", layerId: "stream" },
        volume: Number.NaN,
      },
    );

    expect(
      validateStoredPreferences(
        {
          version: 2,
          favoriteAtmosphereIds: [],
          layerVolumes: {},
          savedMixes: [storedMix, createStoredMix(), { id: "broken" }],
        },
        catalogue,
      ).savedMixes,
    ).toEqual([
      {
        id: "mix-1",
        name: "Rain and trees",
        sceneAtmosphereId: "rainy-apartment",
        layers: [
          {
            sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
            volume: 0.6,
          },
          {
            sound: { atmosphereId: "deep-forest", layerId: "birds" },
            volume: 0.3,
          },
        ],
      },
    ]);
  });

  it("enforces mix names, scenes, layer count and collection count", () => {
    expect(
      validateSavedMix(
        {
          ...createStoredMix(),
          name: "x".repeat(MAX_MIX_NAME_LENGTH + 1),
        },
        catalogue,
      ),
    ).toBeNull();
    expect(
      validateSavedMix(
        { ...createStoredMix(), sceneAtmosphereId: "unknown" },
        catalogue,
      ),
    ).toBeNull();

    const layers = [
      ["rainy-apartment", "rain"],
      ["rainy-apartment", "window-rain"],
      ["rainy-apartment", "thunder"],
      ["deep-forest", "forest-air"],
      ["deep-forest", "birds"],
    ].map(([atmosphereId, layerId]) => ({
      sound: { atmosphereId, layerId },
      volume: 0.5,
    }));
    expect(
      validateSavedMix({ ...createStoredMix(), layers }, catalogue)?.layers,
    ).toHaveLength(MAX_MIX_LAYERS);

    const preferences = validateStoredPreferences(
      {
        version: 2,
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: Array.from({ length: MAX_SAVED_MIXES + 2 }, (_, index) =>
          createStoredMix(`mix-${index}`),
        ),
      },
      catalogue,
    );
    expect(preferences.savedMixes).toHaveLength(MAX_SAVED_MIXES);
  });

  it.each([
    null,
    [],
    { version: 3, favoriteAtmosphereIds: ["deep-forest"] },
    { favoriteAtmosphereIds: ["deep-forest"] },
  ])("uses empty defaults for an unsupported value", (value) => {
    expect(validateStoredPreferences(value, catalogue)).toEqual({
      favoriteAtmosphereIds: [],
      layerVolumes: {},
      savedMixes: [],
    });
    expect(migrateStoredPreferences(value, catalogue)).toBeNull();
  });

  it("migrates V1 atomically to V2 during the first read", () => {
    const legacy = {
      version: 1,
      favoriteAtmosphereIds: ["deep-forest"],
      layerVolumes: { "rainy-apartment": { rain: 0.25 } },
    };
    const storage = createStorage({
      getItem: vi.fn().mockReturnValue(JSON.stringify(legacy)),
    });

    expect(
      createPreferencesStorageAdapter(catalogue, () => storage).read(),
    ).toEqual({
      preferences: {
        favoriteAtmosphereIds: ["deep-forest"],
        layerVolumes: { "rainy-apartment": { rain: 0.25 } },
        savedMixes: [],
      },
      storageAvailable: true,
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        favoriteAtmosphereIds: ["deep-forest"],
        layerVolumes: { "rainy-apartment": { rain: 0.25 } },
        savedMixes: [],
      }),
    );
  });

  it("reads an existing valid V2 snapshot without rewriting it", () => {
    const stored = {
      version: 2,
      favoriteAtmosphereIds: ["rainy-apartment"],
      layerVolumes: {},
      savedMixes: [createStoredMix()],
    };
    const storage = createStorage({
      getItem: vi.fn().mockReturnValue(JSON.stringify(stored)),
    });

    expect(
      createPreferencesStorageAdapter(catalogue, () => storage).read()
        .preferences.savedMixes,
    ).toHaveLength(1);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("ignores an unknown version without deleting or rewriting it", () => {
    const storage = createStorage({
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          version: 99,
          favoriteAtmosphereIds: ["rainy-apartment"],
        }),
      ),
    });

    expect(
      createPreferencesStorageAdapter(catalogue, () => storage).read(),
    ).toEqual({
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: true,
    });
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("keeps migrated preferences in memory if the atomic write fails", () => {
    const storage = createStorage({
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({
          version: 1,
          favoriteAtmosphereIds: ["deep-forest"],
          layerVolumes: {},
        }),
      ),
      setItem: vi.fn(() => {
        throw new DOMException("Full", "QuotaExceededError");
      }),
    });

    expect(
      createPreferencesStorageAdapter(catalogue, () => storage).read(),
    ).toEqual({
      preferences: {
        favoriteAtmosphereIds: ["deep-forest"],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: false,
    });
  });

  it("treats missing and corrupt JSON as an available empty store", () => {
    const missingStorage = createStorage();
    const corruptStorage = createStorage({
      getItem: vi.fn().mockReturnValue("{not-json"),
    });
    const empty = {
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: true,
    };

    expect(
      createPreferencesStorageAdapter(catalogue, () => missingStorage).read(),
    ).toEqual(empty);
    expect(
      createPreferencesStorageAdapter(catalogue, () => corruptStorage).read(),
    ).toEqual(empty);
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
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: false,
    });
    expect(
      adapter.write({
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      }),
    ).toBe(false);
    expect(adapter.reset()).toBe(false);

    const blockedAdapter = createPreferencesStorageAdapter(catalogue, () => {
      throw new DOMException("Blocked", "SecurityError");
    });
    expect(blockedAdapter.read().storageAvailable).toBe(false);
  });

  it("writes one validated V2 snapshot and removes the single key", () => {
    const storage = createStorage();
    const adapter = createPreferencesStorageAdapter(catalogue, () => storage);
    const preferences: PreferencesSnapshot = {
      favoriteAtmosphereIds: ["rainy-apartment", "unknown"],
      layerVolumes: {
        "rainy-apartment": { rain: 0.25, removed: 0.8 },
      },
      savedMixes: [createStoredMix()],
    };

    expect(adapter.write(preferences)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        favoriteAtmosphereIds: ["rainy-apartment"],
        layerVolumes: { "rainy-apartment": { rain: 0.25 } },
        savedMixes: [
          {
            ...createStoredMix(),
            name: "Rain and trees",
          },
        ],
      }),
    );

    expect(adapter.reset()).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(PREFERENCES_STORAGE_KEY);
  });

  it("rejects a serialized snapshot above the expanded storage budget", () => {
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
        savedMixes: [],
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
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: true,
    });
  });
});
