"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  createEmptyPreferences,
  createPreferencesStorageAdapter,
  type PreferenceCatalogueEntry,
  type PreferencesSnapshot,
  type PreferencesStorageAdapter,
} from "./preferences-storage";

export type PreferencesPersistenceStatus =
  "pending" | "available" | "unavailable";

type PreferencesController = PreferencesSnapshot & {
  isHydrated: boolean;
  persistenceStatus: PreferencesPersistenceStatus;
  resetPreferences(): void;
  setFavorite(atmosphereId: string, favorite: boolean): void;
  setLayerVolume(
    atmosphereId: string,
    soundLayerId: string,
    volume: number,
  ): void;
};

type PreferencesProviderProps = {
  catalogue: readonly PreferenceCatalogueEntry[];
  children: ReactNode;
  storageAdapter?: PreferencesStorageAdapter;
  writeDelayMs?: number;
};

const PreferencesContext = createContext<PreferencesController | null>(null);

export function PreferencesProvider({
  catalogue,
  children,
  storageAdapter,
  writeDelayMs = 250,
}: PreferencesProviderProps) {
  const adapterRef = useRef<PreferencesStorageAdapter | null>(null);
  adapterRef.current ??=
    storageAdapter ?? createPreferencesStorageAdapter(catalogue);
  const catalogueMapRef = useRef<ReadonlyMap<
    string,
    ReadonlySet<string>
  > | null>(null);
  catalogueMapRef.current ??= new Map(
    catalogue.map(({ atmosphereId, soundLayerIds }) => [
      atmosphereId,
      new Set(soundLayerIds),
    ]),
  );
  const pendingPreferencesRef = useRef<PreferencesSnapshot | null>(null);
  const preferencesRef = useRef<PreferencesSnapshot>(createEmptyPreferences());
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preferences, setPreferences] = useState<PreferencesSnapshot>(() =>
    createEmptyPreferences(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PreferencesPersistenceStatus>("pending");

  const flushPendingWrite = useCallback((updateStatus = true) => {
    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    const pendingPreferences = pendingPreferencesRef.current;
    if (!pendingPreferences) return;
    pendingPreferencesRef.current = null;
    const writeSucceeded = Boolean(
      adapterRef.current?.write(pendingPreferences),
    );
    if (updateStatus) {
      setPersistenceStatus(writeSucceeded ? "available" : "unavailable");
    }
  }, []);

  const scheduleWrite = useCallback(
    (nextPreferences: PreferencesSnapshot) => {
      pendingPreferencesRef.current = nextPreferences;
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(flushPendingWrite, writeDelayMs);
    },
    [flushPendingWrite, writeDelayMs],
  );

  const commitPreferences = useCallback(
    (nextPreferences: PreferencesSnapshot) => {
      preferencesRef.current = nextPreferences;
      setPreferences(nextPreferences);
      scheduleWrite(nextPreferences);
    },
    [scheduleWrite],
  );

  const setFavorite = useCallback(
    (atmosphereId: string, favorite: boolean) => {
      if (!catalogueMapRef.current?.has(atmosphereId)) return;
      const current = preferencesRef.current;
      const currentlyFavorite =
        current.favoriteAtmosphereIds.includes(atmosphereId);
      if (currentlyFavorite === favorite) return;
      commitPreferences({
        ...current,
        favoriteAtmosphereIds: favorite
          ? [...current.favoriteAtmosphereIds, atmosphereId]
          : current.favoriteAtmosphereIds.filter((id) => id !== atmosphereId),
      });
    },
    [commitPreferences],
  );

  const setLayerVolume = useCallback(
    (atmosphereId: string, soundLayerId: string, volume: number) => {
      if (
        !catalogueMapRef.current?.get(atmosphereId)?.has(soundLayerId) ||
        !Number.isFinite(volume) ||
        volume < 0 ||
        volume > 1
      ) {
        return;
      }
      const current = preferencesRef.current;
      if (current.layerVolumes[atmosphereId]?.[soundLayerId] === volume) return;
      commitPreferences({
        ...current,
        layerVolumes: {
          ...current.layerVolumes,
          [atmosphereId]: {
            ...current.layerVolumes[atmosphereId],
            [soundLayerId]: volume,
          },
        },
      });
    },
    [commitPreferences],
  );

  const resetPreferences = useCallback(() => {
    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    pendingPreferencesRef.current = null;
    const emptyPreferences = createEmptyPreferences();
    preferencesRef.current = emptyPreferences;
    setPreferences(emptyPreferences);
    setPersistenceStatus(
      adapterRef.current?.reset() ? "available" : "unavailable",
    );
  }, []);

  useEffect(() => {
    const result = adapterRef.current?.read() ?? {
      preferences: createEmptyPreferences(),
      storageAvailable: false,
    };
    preferencesRef.current = result.preferences;
    setPreferences(result.preferences);
    setPersistenceStatus(result.storageAvailable ? "available" : "unavailable");
    setIsHydrated(true);

    return () => flushPendingWrite(false);
  }, [flushPendingWrite]);

  const value = useMemo<PreferencesController>(
    () => ({
      ...preferences,
      isHydrated,
      persistenceStatus,
      resetPreferences,
      setFavorite,
      setLayerVolume,
    }),
    [
      isHydrated,
      persistenceStatus,
      preferences,
      resetPreferences,
      setFavorite,
      setLayerVolume,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesController {
  const preferences = useContext(PreferencesContext);
  if (!preferences) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }
  return preferences;
}

export function useOptionalPreferences(): PreferencesController | null {
  return useContext(PreferencesContext);
}
