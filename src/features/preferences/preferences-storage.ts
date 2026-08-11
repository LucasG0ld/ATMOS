export const PREFERENCES_STORAGE_KEY = "atmos.preferences";
export const PREFERENCES_STORAGE_VERSION = 1 as const;
export const PREFERENCES_MAX_SERIALIZED_LENGTH = 32 * 1024;

export type PreferenceCatalogueEntry = {
  atmosphereId: string;
  soundLayerIds: readonly string[];
};

export type PreferencesSnapshot = {
  favoriteAtmosphereIds: readonly string[];
  layerVolumes: Readonly<Record<string, Readonly<Record<string, number>>>>;
};

export type StoredPreferencesV1 = {
  version: typeof PREFERENCES_STORAGE_VERSION;
  favoriteAtmosphereIds: string[];
  layerVolumes: Record<string, Record<string, number>>;
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

export function validateStoredPreferences(
  value: unknown,
  catalogue: readonly PreferenceCatalogueEntry[],
): PreferencesSnapshot {
  if (!isRecord(value) || value.version !== PREFERENCES_STORAGE_VERSION) {
    return createEmptyPreferences();
  }

  const catalogueMap = createCatalogueMap(catalogue);
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

function toStoredPreferences(
  preferences: PreferencesSnapshot,
  catalogue: readonly PreferenceCatalogueEntry[],
): StoredPreferencesV1 {
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
  };
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
      try {
        return {
          preferences: validateStoredPreferences(
            JSON.parse(serialized) as unknown,
            catalogue,
          ),
          storageAvailable: true,
        };
      } catch {
        return {
          preferences: createEmptyPreferences(),
          storageAvailable: true,
        };
      }
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
