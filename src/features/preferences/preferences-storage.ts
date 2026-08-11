import type { SavedMix } from "../../types/mix";

export const PREFERENCES_STORAGE_KEY = "atmos.preferences";
export const PREFERENCES_LEGACY_STORAGE_VERSION = 1 as const;
export const PREFERENCES_STORAGE_VERSION = 2 as const;
export const PREFERENCES_MAX_SERIALIZED_LENGTH = 128 * 1024;
export const MAX_SAVED_MIXES = 20;
export const MAX_MIX_LAYERS = 4;
export const MAX_MIX_NAME_LENGTH = 40;
export const MAX_MIX_ID_LENGTH = 128;

export type PreferenceCatalogueEntry = {
  atmosphereId: string;
  soundLayerIds: readonly string[];
};

export type PreferencesSnapshot = {
  favoriteAtmosphereIds: readonly string[];
  layerVolumes: Readonly<Record<string, Readonly<Record<string, number>>>>;
  savedMixes: readonly SavedMix[];
};

export type StoredPreferencesV1 = {
  version: typeof PREFERENCES_LEGACY_STORAGE_VERSION;
  favoriteAtmosphereIds: string[];
  layerVolumes: Record<string, Record<string, number>>;
};

export type StoredPreferencesV2 = {
  version: typeof PREFERENCES_STORAGE_VERSION;
  favoriteAtmosphereIds: string[];
  layerVolumes: Record<string, Record<string, number>>;
  savedMixes: SavedMix[];
};

export type PreferencesReadResult = {
  preferences: PreferencesSnapshot;
  storageAvailable: boolean;
};

export type PreferencesStorageAdapter = {
  read(): PreferencesReadResult;
  reset(): boolean;
  write(preferences: PreferencesSnapshot): boolean;
};

type StorageGetter = () => Storage | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createEmptyPreferences(): PreferencesSnapshot {
  return {
    favoriteAtmosphereIds: [],
    layerVolumes: {},
    savedMixes: [],
  };
}

function createCatalogueMap(
  catalogue: readonly PreferenceCatalogueEntry[],
): ReadonlyMap<string, ReadonlySet<string>> {
  return new Map(
    catalogue.map(({ atmosphereId, soundLayerIds }) => [
      atmosphereId,
      new Set(soundLayerIds),
    ]),
  );
}

function validateCommonPreferences(
  value: Record<string, unknown>,
  catalogueMap: ReadonlyMap<string, ReadonlySet<string>>,
): Pick<PreferencesSnapshot, "favoriteAtmosphereIds" | "layerVolumes"> {
  const favoriteAtmosphereIds: string[] = [];
  const seenFavorites = new Set<string>();
  if (Array.isArray(value.favoriteAtmosphereIds)) {
    for (const atmosphereId of value.favoriteAtmosphereIds) {
      if (
        typeof atmosphereId === "string" &&
        catalogueMap.has(atmosphereId) &&
        !seenFavorites.has(atmosphereId)
      ) {
        seenFavorites.add(atmosphereId);
        favoriteAtmosphereIds.push(atmosphereId);
      }
    }
  }

  const layerVolumes: Record<string, Record<string, number>> = {};
  if (isRecord(value.layerVolumes)) {
    for (const [atmosphereId, soundLayerIds] of catalogueMap) {
      const storedLayers = value.layerVolumes[atmosphereId];
      if (!isRecord(storedLayers)) continue;

      const validLayers: Record<string, number> = {};
      for (const soundLayerId of soundLayerIds) {
        const volume = storedLayers[soundLayerId];
        if (
          typeof volume === "number" &&
          Number.isFinite(volume) &&
          volume >= 0 &&
          volume <= 1
        ) {
          validLayers[soundLayerId] = volume;
        }
      }
      if (Object.keys(validLayers).length > 0) {
        layerVolumes[atmosphereId] = validLayers;
      }
    }
  }

  return { favoriteAtmosphereIds, layerVolumes };
}

function validateSavedMixWithMap(
  value: unknown,
  catalogueMap: ReadonlyMap<string, ReadonlySet<string>>,
): SavedMix | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    value.id.length > MAX_MIX_ID_LENGTH ||
    value.id.trim() !== value.id
  ) {
    return null;
  }

  if (typeof value.name !== "string") return null;
  const name = value.name.trim();
  if (name.length === 0 || Array.from(name).length > MAX_MIX_NAME_LENGTH) {
    return null;
  }

  if (
    typeof value.sceneAtmosphereId !== "string" ||
    !catalogueMap.has(value.sceneAtmosphereId) ||
    !Array.isArray(value.layers)
  ) {
    return null;
  }

  const layers: SavedMix["layers"][number][] = [];
  const seenLayers = new Set<string>();
  for (const layer of value.layers) {
    if (layers.length === MAX_MIX_LAYERS) break;
    if (!isRecord(layer) || !isRecord(layer.sound)) continue;

    const { atmosphereId, layerId } = layer.sound;
    if (
      typeof atmosphereId !== "string" ||
      typeof layerId !== "string" ||
      !catalogueMap.get(atmosphereId)?.has(layerId) ||
      typeof layer.volume !== "number" ||
      !Number.isFinite(layer.volume) ||
      layer.volume < 0 ||
      layer.volume > 1
    ) {
      continue;
    }

    const referenceKey = `${atmosphereId}:${layerId}`;
    if (seenLayers.has(referenceKey)) continue;
    seenLayers.add(referenceKey);
    layers.push({
      sound: { atmosphereId, layerId },
      volume: layer.volume,
    });
  }

  if (layers.length === 0) return null;
  return {
    id: value.id,
    name,
    sceneAtmosphereId: value.sceneAtmosphereId,
    layers,
  };
}

export function validateSavedMix(
  value: unknown,
  catalogue: readonly PreferenceCatalogueEntry[],
): SavedMix | null {
  return validateSavedMixWithMap(value, createCatalogueMap(catalogue));
}

function validateSavedMixes(
  value: unknown,
  catalogueMap: ReadonlyMap<string, ReadonlySet<string>>,
): SavedMix[] {
  if (!Array.isArray(value)) return [];

  const savedMixes: SavedMix[] = [];
  const seenIds = new Set<string>();
  for (const candidate of value) {
    if (savedMixes.length === MAX_SAVED_MIXES) break;
    const mix = validateSavedMixWithMap(candidate, catalogueMap);
    if (!mix || seenIds.has(mix.id)) continue;
    seenIds.add(mix.id);
    savedMixes.push(mix);
  }
  return savedMixes;
}

export function validateStoredPreferences(
  value: unknown,
  catalogue: readonly PreferenceCatalogueEntry[],
): PreferencesSnapshot {
  if (
    !isRecord(value) ||
    (value.version !== PREFERENCES_LEGACY_STORAGE_VERSION &&
      value.version !== PREFERENCES_STORAGE_VERSION)
  ) {
    return createEmptyPreferences();
  }

  const catalogueMap = createCatalogueMap(catalogue);
  const common = validateCommonPreferences(value, catalogueMap);
  return {
    ...common,
    savedMixes:
      value.version === PREFERENCES_STORAGE_VERSION
        ? validateSavedMixes(value.savedMixes, catalogueMap)
        : [],
  };
}

function toStoredPreferences(
  preferences: PreferencesSnapshot,
  catalogue: readonly PreferenceCatalogueEntry[],
): StoredPreferencesV2 {
  const validated = validateStoredPreferences(
    { version: PREFERENCES_STORAGE_VERSION, ...preferences },
    catalogue,
  );
  return {
    version: PREFERENCES_STORAGE_VERSION,
    favoriteAtmosphereIds: [...validated.favoriteAtmosphereIds],
    layerVolumes: Object.fromEntries(
      Object.entries(validated.layerVolumes).map(([atmosphereId, volumes]) => [
        atmosphereId,
        { ...volumes },
      ]),
    ),
    savedMixes: validated.savedMixes.map((mix) => ({
      ...mix,
      layers: mix.layers.map((layer) => ({
        sound: { ...layer.sound },
        volume: layer.volume,
      })),
    })),
  };
}

export function migrateStoredPreferences(
  value: unknown,
  catalogue: readonly PreferenceCatalogueEntry[],
): StoredPreferencesV2 | null {
  if (
    !isRecord(value) ||
    (value.version !== PREFERENCES_LEGACY_STORAGE_VERSION &&
      value.version !== PREFERENCES_STORAGE_VERSION)
  ) {
    return null;
  }
  return toStoredPreferences(
    validateStoredPreferences(value, catalogue),
    catalogue,
  );
}

export function createPreferencesStorageAdapter(
  catalogue: readonly PreferenceCatalogueEntry[],
  getStorage: StorageGetter = () => window.localStorage,
): PreferencesStorageAdapter {
  const resolveStorage = (): Storage | null => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };

  return {
    read() {
      const storage = resolveStorage();
      if (!storage) {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: false,
        };
      }

      let serialized: string | null;
      try {
        serialized = storage.getItem(PREFERENCES_STORAGE_KEY);
      } catch {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: false,
        };
      }
      if (serialized === null) {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: true,
        };
      }
      if (serialized.length > PREFERENCES_MAX_SERIALIZED_LENGTH) {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: true,
        };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(serialized) as unknown;
      } catch {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: true,
        };
      }

      const migrated = migrateStoredPreferences(parsed, catalogue);
      if (!migrated) {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: true,
        };
      }

      let storageAvailable = true;
      if (
        isRecord(parsed) &&
        parsed.version === PREFERENCES_LEGACY_STORAGE_VERSION
      ) {
        try {
          const migratedSerialized = JSON.stringify(migrated);
          if (migratedSerialized.length > PREFERENCES_MAX_SERIALIZED_LENGTH) {
            storageAvailable = false;
          } else {
            storage.setItem(PREFERENCES_STORAGE_KEY, migratedSerialized);
          }
        } catch {
          storageAvailable = false;
        }
      }

      return {
        preferences: validateStoredPreferences(migrated, catalogue),
        storageAvailable,
      };
    },

    reset() {
      const storage = resolveStorage();
      if (!storage) return false;
      try {
        storage.removeItem(PREFERENCES_STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    },

    write(preferences) {
      const storage = resolveStorage();
      if (!storage) return false;
      try {
        const serialized = JSON.stringify(
          toStoredPreferences(preferences, catalogue),
        );
        if (serialized.length > PREFERENCES_MAX_SERIALIZED_LENGTH) return false;
        storage.setItem(PREFERENCES_STORAGE_KEY, serialized);
        return true;
      } catch {
        return false;
      }
    },
  };
}
