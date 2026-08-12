"use client";

import {
  ArrowLeft,
  Focus,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AtmosphereScene } from "../../components/atmosphere/atmosphere-scene";
import { AtmosSlider } from "../../components/controls/atmos-slider";
import { SessionTimerControl } from "../../components/controls/session-timer-control";
import { Wordmark } from "../../components/shared/wordmark";
import {
  atmospheres,
  getAtmosphereBySlug,
  rainyApartment,
} from "../../data/atmospheres";
import {
  getSoundByReference,
  getSoundReferenceKey,
  soundCatalogue,
  type SoundCatalogueEntry,
} from "../../data/sounds";
import { useOptionalPreferences } from "../preferences/preferences-provider";
import { useAudioSession } from "../audio/audio-session";
import {
  FocusModeSecondary,
  FocusModeSurface,
  useOptionalFocusMode,
} from "../focus/focus-mode";
import type { Atmosphere } from "../../types/atmosphere";
import type { SoundReference } from "../../types/mix";

import styles from "./composer.module.css";

const MAX_LAYERS = 4;

type DraftLayer = {
  sound: SoundReference;
  volume: number;
};

function getRequestedScene(): Atmosphere {
  if (typeof window === "undefined") return rainyApartment;
  const slug = new URLSearchParams(window.location.search).get("scene");
  return getAtmosphereBySlug(slug ?? "") ?? rainyApartment;
}

function createInitialLayers(
  scene: Atmosphere,
  storedVolumes?: Readonly<Record<string, number>>,
): DraftLayer[] {
  return scene.sounds.map((sound) => ({
    sound: { atmosphereId: scene.id, layerId: sound.id },
    volume: Math.round(
      (storedVolumes?.[sound.id] ?? sound.defaultVolume) * 100,
    ),
  }));
}

function closeDialog(dialog: HTMLDialogElement | null) {
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

export function Composer() {
  const preferences = useOptionalPreferences();
  const focusMode = useOptionalFocusMode();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const focusTriggerRef = useRef<HTMLButtonElement>(null);
  const libraryTriggerRef = useRef<HTMLButtonElement>(null);
  const initializationRef = useRef("");
  const libraryTitleId = useId();
  const libraryDescriptionId = useId();
  const layerRequirementId = useId();
  const playbackNoteId = useId();
  const saveNoteId = useId();
  const [scene, setScene] = useState<Atmosphere>(rainyApartment);
  const [layers, setLayers] = useState<DraftLayer[]>(() =>
    createInitialLayers(rainyApartment),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const liveAtmosphere = useMemo<Atmosphere>(
    () => ({
      ...scene,
      id: `custom:${scene.id}`,
      name: "Untitled mix",
      sounds: layers.flatMap((layer) => {
        const entry = getSoundByReference(layer.sound);
        return entry
          ? [
              {
                ...entry.sound,
                id: getSoundReferenceKey(layer.sound),
                defaultVolume: layer.volume / 100,
              },
            ]
          : [];
      }),
    }),
    [layers, scene],
  );
  const session = useAudioSession(liveAtmosphere);

  useEffect(() => {
    const requestedScene = getRequestedScene();
    const isHydrated = preferences?.isHydrated ?? true;
    const initializationKey = `${requestedScene.id}:${String(isHydrated)}`;
    if (initializationRef.current === initializationKey) return;
    initializationRef.current = initializationKey;
    setScene(requestedScene);
    setLayers(
      createInitialLayers(
        requestedScene,
        isHydrated ? preferences?.layerVolumes[requestedScene.id] : undefined,
      ),
    );
    setIsDirty(false);
  }, [preferences]);

  const activeSoundKeys = new Set(
    layers.map(({ sound }) => getSoundReferenceKey(sound)),
  );
  const isFull = layers.length >= MAX_LAYERS;
  const isHydrated = preferences?.isHydrated ?? true;
  const playbackState = session?.playbackState ?? "idle";
  const isPlaying = playbackState === "playing";
  const playbackAction =
    playbackState === "loading"
      ? "Loading"
      : playbackState === "error"
        ? "Retry"
        : isPlaying
          ? "Pause"
          : "Play";
  const PlaybackIcon =
    playbackState === "loading"
      ? LoaderCircle
      : playbackState === "error"
        ? RotateCcw
        : isPlaying
          ? Pause
          : Play;

  const togglePlayback = () => {
    if (!session || playbackState === "loading") return;
    const volumes = Object.fromEntries(
      layers.map((layer) => [getSoundReferenceKey(layer.sound), layer.volume]),
    );
    void session.togglePlayback(liveAtmosphere, volumes);
  };

  const openLibrary = () => {
    setAnnouncement("");
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  const addSound = (entry: SoundCatalogueEntry) => {
    const soundKey = getSoundReferenceKey(entry);
    if (isFull || activeSoundKeys.has(soundKey)) return;
    const storedVolume =
      preferences?.layerVolumes[entry.atmosphereId]?.[entry.layerId];
    setLayers((current) => [
      ...current,
      {
        sound: {
          atmosphereId: entry.atmosphereId,
          layerId: entry.layerId,
        },
        volume: Math.round((storedVolume ?? entry.sound.defaultVolume) * 100),
      },
    ]);
    setIsDirty(true);
    setAnnouncement(`${entry.sound.name} added to the mix.`);
    closeDialog(dialogRef.current);
  };

  const removeSound = (reference: SoundReference) => {
    if (layers.length <= 1) {
      setAnnouncement("A mix needs at least one sound.");
      return;
    }
    const soundKey = getSoundReferenceKey(reference);
    const entry = getSoundByReference(reference);
    setLayers((current) =>
      current.filter((layer) => getSoundReferenceKey(layer.sound) !== soundKey),
    );
    setIsDirty(true);
    setAnnouncement(`${entry?.sound.name ?? "Sound"} removed from the mix.`);
  };

  const updateVolume = (reference: SoundReference, volume: number) => {
    const soundKey = getSoundReferenceKey(reference);
    setLayers((current) =>
      current.map((layer) =>
        getSoundReferenceKey(layer.sound) === soundKey
          ? { ...layer, volume }
          : layer,
      ),
    );
    setIsDirty(true);
    session?.setLayerVolume(getSoundReferenceKey(reference), volume / 100);
  };

  return (
    <AtmosphereScene atmosphere={scene}>
      <FocusModeSurface>
        <main className={`safe-area-frame min-h-dvh ${styles.frame}`}>
          <FocusModeSecondary>
            <header className={styles.header}>
              <Wordmark />
              <Link
                aria-label={`Back to ${scene.name}`}
                className={`text-label ${styles.backLink}`}
                href={`/atmosphere/${scene.slug}`}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                <span>Back to scene</span>
              </Link>
            </header>
          </FocusModeSecondary>

          <section aria-labelledby="mix-title" className={styles.stage}>
            <div className={styles.editorial}>
              <FocusModeSecondary>
                <p className={`text-label ${styles.eyebrow}`}>
                  Custom atmosphere · {scene.name}
                </p>
              </FocusModeSecondary>
              <h1
                className={`text-display font-normal ${styles.title}`}
                id="mix-title"
              >
                Untitled mix
              </h1>
              <FocusModeSecondary>
                <p className={`text-body ${styles.introduction}`}>
                  Begin with this scene, then bring together up to four sounds.
                </p>
              </FocusModeSecondary>
              <button
                aria-busy={playbackState === "loading"}
                aria-describedby={
                  session?.statusMessage ? playbackNoteId : undefined
                }
                aria-label={`${playbackAction} Untitled mix`}
                className={styles.playButton}
                data-focus-playback=""
                data-playing={isPlaying ? "true" : "false"}
                disabled={!session || playbackState === "loading"}
                onClick={togglePlayback}
                type="button"
              >
                <PlaybackIcon
                  aria-hidden="true"
                  className={
                    playbackState === "loading" ? styles.loadingIcon : undefined
                  }
                  fill="currentColor"
                  size={18}
                />
                <span className="text-label">{playbackAction}</span>
              </button>
              <div className={styles.sessionActions}>
                <SessionTimerControl />
                {focusMode && !focusMode.isFocusMode ? (
                  <button
                    className={`text-label ${styles.focusButton}`}
                    data-focus-trigger=""
                    onClick={() => {
                      if (focusTriggerRef.current) {
                        focusMode.enterFocus(focusTriggerRef.current);
                      }
                    }}
                    ref={focusTriggerRef}
                    type="button"
                  >
                    <Focus aria-hidden="true" size={15} strokeWidth={1.5} />
                    <span>Focus</span>
                  </button>
                ) : null}
              </div>
              {session?.statusMessage ? (
                <p
                  className={styles.availabilityNote}
                  id={playbackNoteId}
                  role={playbackState === "error" ? "alert" : "status"}
                >
                  {session.statusMessage}
                </p>
              ) : null}
            </div>

            <FocusModeSecondary>
              <div className={styles.composer}>
                <div className={styles.composerHeader}>
                  <div>
                    <p className={`text-label ${styles.sectionLabel}`}>
                      Sound layers
                    </p>
                    <p className={styles.layerCount}>
                      {layers.length} of {MAX_LAYERS}
                    </p>
                  </div>
                  <p className={`text-label ${styles.dirtyState}`}>
                    {isDirty ? "Unsaved draft" : "New draft"}
                  </p>
                </div>

                <ol className={styles.layers}>
                  {layers.map((layer) => {
                    const entry = getSoundByReference(layer.sound);
                    if (!entry) return null;
                    const soundKey = getSoundReferenceKey(layer.sound);
                    const isOnlyLayer = layers.length === 1;
                    return (
                      <li className={styles.layer} key={soundKey}>
                        <p className={styles.origin}>{entry.atmosphereName}</p>
                        <div className={styles.layerControls}>
                          <AtmosSlider
                            accessibleLabel={`${entry.sound.name} from ${entry.atmosphereName}`}
                            disabled={
                              !isHydrated ||
                              session?.unavailableLayerIds.has(soundKey)
                            }
                            label={entry.sound.name}
                            onValueChange={(value) =>
                              updateVolume(layer.sound, value)
                            }
                            value={layer.volume}
                          />
                          <button
                            aria-describedby={
                              isOnlyLayer ? layerRequirementId : undefined
                            }
                            aria-label={`Remove ${entry.sound.name}`}
                            className={styles.removeButton}
                            disabled={isOnlyLayer}
                            onClick={() => removeSound(layer.sound)}
                            type="button"
                          >
                            <Trash2
                              aria-hidden="true"
                              size={17}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {layers.length === 1 ? (
                  <p className={styles.requirement} id={layerRequirementId}>
                    A mix needs at least one sound.
                  </p>
                ) : null}

                <div className={styles.actions}>
                  <button
                    className={`text-label ${styles.addButton}`}
                    onClick={openLibrary}
                    ref={libraryTriggerRef}
                    type="button"
                  >
                    <Plus aria-hidden="true" size={16} strokeWidth={1.5} />
                    {isFull ? "Mix full · 4 sounds" : "Add sound"}
                  </button>
                  <button
                    aria-describedby={saveNoteId}
                    className={`text-label ${styles.saveButton}`}
                    disabled
                    type="button"
                  >
                    Save mix
                  </button>
                </div>
                <p className={styles.availabilityNote} id={saveNoteId}>
                  Saving will be enabled with local mix management.
                </p>
                <p aria-live="polite" className={styles.announcement}>
                  {announcement}
                </p>
              </div>
            </FocusModeSecondary>
          </section>
        </main>

        <dialog
          aria-describedby={libraryDescriptionId}
          aria-labelledby={libraryTitleId}
          className={styles.dialog}
          onClose={() => libraryTriggerRef.current?.focus()}
          ref={dialogRef}
        >
          <div className={styles.dialogPanel}>
            <header className={styles.dialogHeader}>
              <div>
                <p className={`text-label ${styles.sectionLabel}`}>
                  Sound library
                </p>
                <h2 className={styles.dialogTitle} id={libraryTitleId}>
                  Add a sound
                </h2>
              </div>
              <button
                aria-label="Close sound library"
                className={styles.closeButton}
                onClick={() => closeDialog(dialogRef.current)}
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </header>
            <p
              className={`text-body ${styles.dialogDescription}`}
              id={libraryDescriptionId}
            >
              {isFull
                ? "This mix already has four sounds. Remove one before adding another."
                : "Choose from the sounds already licensed for ATMOS."}
            </p>

            <div className={styles.libraryGroups}>
              {atmospheres.map((atmosphere) => {
                const groupId = `${libraryTitleId}-${atmosphere.id}`;
                return (
                  <section aria-labelledby={groupId} key={atmosphere.id}>
                    <h3
                      className={`text-label ${styles.groupTitle}`}
                      id={groupId}
                    >
                      {atmosphere.name}
                    </h3>
                    <ul className={styles.libraryList}>
                      {soundCatalogue
                        .filter(
                          ({ atmosphereId }) => atmosphereId === atmosphere.id,
                        )
                        .map((entry) => {
                          const isAdded = activeSoundKeys.has(
                            getSoundReferenceKey(entry),
                          );
                          return (
                            <li key={getSoundReferenceKey(entry)}>
                              <button
                                aria-label={`${isAdded ? "Added" : "Add"} ${entry.sound.name} from ${entry.atmosphereName}`}
                                className={styles.soundOption}
                                disabled={isAdded || isFull || !isHydrated}
                                onClick={() => addSound(entry)}
                                type="button"
                              >
                                <span>{entry.sound.name}</span>
                                <span className={styles.optionState}>
                                  {isAdded ? "Added" : "Add"}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </dialog>
      </FocusModeSurface>
    </AtmosphereScene>
  );
}
