"use client";

import {
  ArrowLeft,
  Focus,
  LoaderCircle,
  Pencil,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

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
import type { SavedMix, SavedMixDraft, SoundReference } from "../../types/mix";
import {
  MAX_MIX_NAME_LENGTH,
  MAX_SAVED_MIXES,
} from "../preferences/preferences-storage";

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
  const libraryDialogRef = useRef<HTMLDialogElement>(null);
  const nameDialogRef = useRef<HTMLDialogElement>(null);
  const mixesDialogRef = useRef<HTMLDialogElement>(null);
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);
  const backLinkRef = useRef<HTMLAnchorElement>(null);
  const focusTriggerRef = useRef<HTMLButtonElement>(null);
  const libraryTriggerRef = useRef<HTMLButtonElement>(null);
  const saveTriggerRef = useRef<HTMLButtonElement>(null);
  const mixesTriggerRef = useRef<HTMLButtonElement>(null);
  const nameTriggerRef = useRef<HTMLElement | null>(null);
  const confirmationTriggerRef = useRef<HTMLElement | null>(null);
  const initializationRef = useRef("");
  const libraryTitleId = useId();
  const libraryDescriptionId = useId();
  const nameTitleId = useId();
  const nameDescriptionId = useId();
  const mixesTitleId = useId();
  const mixesDescriptionId = useId();
  const confirmationTitleId = useId();
  const confirmationDescriptionId = useId();
  const layerRequirementId = useId();
  const playbackNoteId = useId();
  const saveNoteId = useId();
  const [scene, setScene] = useState<Atmosphere>(rainyApartment);
  const [layers, setLayers] = useState<DraftLayer[]>(() =>
    createInitialLayers(rainyApartment),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [mixName, setMixName] = useState("Untitled mix");
  const [currentMixId, setCurrentMixId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [renameMixId, setRenameMixId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<
    | { kind: "discard"; mixId?: string }
    | { kind: "delete"; mixId: string; name: string }
    | { kind: "back" }
    | null
  >(null);

  const liveAtmosphere = useMemo<Atmosphere>(
    () => ({
      ...scene,
      id: `custom:${scene.id}`,
      name: mixName,
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
    [layers, mixName, scene],
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
    setMixName("Untitled mix");
    setCurrentMixId(null);
  }, [preferences]);

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const activeSoundKeys = new Set(
    layers.map(({ sound }) => getSoundReferenceKey(sound)),
  );
  const hasMultipleOrigins =
    new Set(layers.map(({ sound }) => sound.atmosphereId)).size > 1;
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
  const currentSavedMix = preferences?.savedMixes.find(
    ({ id }) => id === currentMixId,
  );
  const isNewMixLimitReached =
    currentMixId === null &&
    (preferences?.savedMixes.length ?? 0) >= MAX_SAVED_MIXES;

  const createDraft = (name: string): SavedMixDraft => ({
    name,
    sceneAtmosphereId: scene.id,
    layers: layers.map((layer) => ({
      sound: { ...layer.sound },
      volume: layer.volume / 100,
    })),
  });

  const showDialog = (dialog: HTMLDialogElement | null) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  const openNameDialog = (mix?: SavedMix, trigger?: HTMLElement) => {
    nameTriggerRef.current = trigger ?? saveTriggerRef.current;
    setRenameMixId(mix?.id ?? null);
    setNameInput(mix?.name ?? (currentMixId ? mixName : ""));
    setNameError("");
    showDialog(nameDialogRef.current);
    window.setTimeout(() => {
      nameDialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    });
  };

  const openMixes = () => {
    setAnnouncement("");
    showDialog(mixesDialogRef.current);
  };

  const applySavedMix = (mix: SavedMix) => {
    const nextScene = atmospheres.find(
      ({ id }) => id === mix.sceneAtmosphereId,
    );
    if (!nextScene) return;
    setScene(nextScene);
    setLayers(
      mix.layers.map((layer) => ({
        sound: { ...layer.sound },
        volume: Math.round(layer.volume * 100),
      })),
    );
    setMixName(mix.name);
    setCurrentMixId(mix.id);
    setIsDirty(false);
    setAnnouncement(`${mix.name} opened.`);
    closeDialog(mixesDialogRef.current);
  };

  const requestOpenMix = (mix: SavedMix, trigger: HTMLElement) => {
    if (!isDirty) {
      applySavedMix(mix);
      return;
    }
    confirmationTriggerRef.current = trigger;
    setConfirmation({ kind: "discard", mixId: mix.id });
    showDialog(confirmationDialogRef.current);
  };

  const requestBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isDirty) return;
    event.preventDefault();
    confirmationTriggerRef.current = event.currentTarget;
    setConfirmation({ kind: "back" });
    showDialog(confirmationDialogRef.current);
  };

  const resetToNewDraft = (sourceScene = scene) => {
    setScene(sourceScene);
    setLayers(
      createInitialLayers(
        sourceScene,
        preferences?.layerVolumes[sourceScene.id],
      ),
    );
    setMixName("Untitled mix");
    setCurrentMixId(null);
    setIsDirty(false);
  };

  const saveExistingMix = () => {
    if (!preferences || !currentMixId) return;
    if (!preferences.updateMix(currentMixId, createDraft(mixName))) {
      setAnnouncement(
        "This mix could not be saved. Check the local storage limit.",
      );
      return;
    }
    setIsDirty(false);
    setAnnouncement(
      preferences.persistenceStatus === "unavailable"
        ? "Mix kept for this visit, but could not be saved on this device."
        : "Mix saved on this device.",
    );
  };

  const submitName = () => {
    if (!preferences) return;
    const name = nameInput.trim();
    if (!name) {
      setNameError("Enter a name for this mix.");
      return;
    }
    if (Array.from(name).length > MAX_MIX_NAME_LENGTH) {
      setNameError(`Use ${MAX_MIX_NAME_LENGTH} characters or fewer.`);
      return;
    }

    if (renameMixId) {
      const target = preferences.savedMixes.find(
        ({ id }) => id === renameMixId,
      );
      if (!target || !preferences.updateMix(target.id, { ...target, name })) {
        setNameError("This name could not be saved on this device.");
        return;
      }
      if (currentMixId === target.id) setMixName(name);
      setAnnouncement("Mix renamed on this device.");
    } else {
      if (preferences.savedMixes.length >= MAX_SAVED_MIXES) {
        setNameError(
          `This device already has ${MAX_SAVED_MIXES} mixes. Delete one before saving another.`,
        );
        return;
      }
      const id = preferences.createMix(createDraft(name));
      if (!id) {
        setNameError(
          "This mix exceeds the local storage limit or could not be saved.",
        );
        return;
      }
      setCurrentMixId(id);
      setMixName(name);
      setIsDirty(false);
      setAnnouncement(
        preferences.persistenceStatus === "unavailable"
          ? "Mix kept for this visit, but could not be saved on this device."
          : "Mix saved on this device.",
      );
    }
    closeDialog(nameDialogRef.current);
  };

  const confirmAction = () => {
    if (!preferences || !confirmation) return;
    if (confirmation.kind === "delete") {
      const deleted = preferences.deleteMix(confirmation.mixId);
      if (deleted && currentMixId === confirmation.mixId) resetToNewDraft();
      setAnnouncement(
        deleted ? "Mix deleted from this device." : "Mix not found.",
      );
      if (deleted && preferences.savedMixes.length === 1) {
        closeDialog(mixesDialogRef.current);
        confirmationTriggerRef.current = backLinkRef.current;
      } else {
        confirmationTriggerRef.current =
          mixesDialogRef.current?.querySelector<HTMLButtonElement>(
            '[aria-label="Close your mixes"]',
          ) ?? mixesTriggerRef.current;
      }
      closeDialog(confirmationDialogRef.current);
      return;
    }
    if (confirmation.kind === "discard" && confirmation.mixId) {
      const target = preferences.savedMixes.find(
        ({ id }) => id === confirmation.mixId,
      );
      if (target) applySavedMix(target);
      closeDialog(confirmationDialogRef.current);
      return;
    }
    if (confirmation.kind === "back") {
      window.location.assign(
        backLinkRef.current?.href ?? `/atmosphere/${scene.slug}`,
      );
    }
  };

  const togglePlayback = () => {
    if (!session || playbackState === "loading") return;
    const volumes = Object.fromEntries(
      layers.map((layer) => [getSoundReferenceKey(layer.sound), layer.volume]),
    );
    void session.togglePlayback(liveAtmosphere, volumes);
  };

  const openLibrary = () => {
    setAnnouncement("");
    showDialog(libraryDialogRef.current);
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
    closeDialog(libraryDialogRef.current);
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
              <div className={styles.headerActions}>
                {preferences?.savedMixes.length ? (
                  <button
                    className={`text-label ${styles.mixesButton}`}
                    onClick={openMixes}
                    ref={mixesTriggerRef}
                    type="button"
                  >
                    Your mixes
                  </button>
                ) : null}
                <Link
                  aria-label={`Back to ${scene.name}`}
                  className={`text-label ${styles.backLink}`}
                  href={`/atmosphere/${scene.slug}`}
                  onClick={requestBack}
                  ref={backLinkRef}
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                  <span>Scene</span>
                </Link>
              </div>
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
                {mixName}
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
                aria-label={`${playbackAction} ${mixName}`}
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
                    {isDirty
                      ? "Unsaved changes"
                      : currentSavedMix
                        ? "Saved on this device"
                        : "New draft"}
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
                        {hasMultipleOrigins ? (
                          <p className={styles.origin} data-layer-origin="">
                            {entry.atmosphereName}
                          </p>
                        ) : null}
                        <div className={styles.layerControls}>
                          <AtmosSlider
                            accessibleLabel={
                              hasMultipleOrigins
                                ? `${entry.sound.name} from ${entry.atmosphereName}`
                                : entry.sound.name
                            }
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
                    disabled={
                      !preferences?.isHydrated ||
                      (currentMixId !== null && !isDirty) ||
                      isNewMixLimitReached
                    }
                    onClick={() =>
                      currentMixId ? saveExistingMix() : openNameDialog()
                    }
                    ref={saveTriggerRef}
                    type="button"
                  >
                    {currentMixId ? "Save changes" : "Save mix"}
                  </button>
                </div>
                <p
                  className={styles.availabilityNote}
                  id={saveNoteId}
                  role={
                    preferences?.persistenceStatus === "unavailable"
                      ? "status"
                      : undefined
                  }
                >
                  {preferences?.persistenceStatus === "unavailable"
                    ? "Changes remain available for this visit, but device storage is unavailable."
                    : isNewMixLimitReached
                      ? `This device already has ${MAX_SAVED_MIXES} mixes. Delete one before saving another.`
                      : currentMixId && !isDirty
                        ? "This mix is up to date."
                        : "Mixes are stored only on this device."}
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
          ref={libraryDialogRef}
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
                onClick={() => closeDialog(libraryDialogRef.current)}
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

        <dialog
          aria-describedby={nameDescriptionId}
          aria-labelledby={nameTitleId}
          className={styles.dialog}
          onClose={() => nameTriggerRef.current?.focus()}
          ref={nameDialogRef}
        >
          <form
            className={`${styles.dialogPanel} ${styles.compactPanel}`}
            onSubmit={(event) => {
              event.preventDefault();
              submitName();
            }}
          >
            <header className={styles.dialogHeader}>
              <div>
                <p className={`text-label ${styles.sectionLabel}`}>
                  Saved locally
                </p>
                <h2 className={styles.dialogTitle} id={nameTitleId}>
                  {renameMixId ? "Rename mix" : "Name your mix"}
                </h2>
              </div>
              <button
                aria-label="Close mix name"
                className={styles.closeButton}
                onClick={() => closeDialog(nameDialogRef.current)}
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </header>
            <p
              className={`text-body ${styles.dialogDescription}`}
              id={nameDescriptionId}
            >
              Use 1 to {MAX_MIX_NAME_LENGTH} characters. Identical names are
              allowed.
            </p>
            <label className={styles.nameField}>
              <span className="text-label">Mix name</span>
              <input
                aria-describedby={
                  nameError
                    ? `${nameDescriptionId} ${nameTitleId}-error`
                    : nameDescriptionId
                }
                maxLength={MAX_MIX_NAME_LENGTH}
                onChange={(event) => {
                  setNameInput(event.target.value);
                  setNameError("");
                }}
                value={nameInput}
              />
            </label>
            <p className={styles.characterCount}>
              {Array.from(nameInput).length} / {MAX_MIX_NAME_LENGTH}
            </p>
            {nameError ? (
              <p
                className={styles.errorMessage}
                id={`${nameTitleId}-error`}
                role="alert"
              >
                {nameError}
              </p>
            ) : null}
            <div className={styles.dialogActions}>
              <button
                className={`text-label ${styles.secondaryButton}`}
                onClick={() => closeDialog(nameDialogRef.current)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`text-label ${styles.primaryButton}`}
                type="submit"
              >
                {renameMixId ? "Save name" : "Save"}
              </button>
            </div>
          </form>
        </dialog>

        <dialog
          aria-describedby={mixesDescriptionId}
          aria-labelledby={mixesTitleId}
          className={styles.dialog}
          onClose={() => mixesTriggerRef.current?.focus()}
          ref={mixesDialogRef}
        >
          <div className={styles.dialogPanel}>
            <header className={styles.dialogHeader}>
              <div>
                <p className={`text-label ${styles.sectionLabel}`}>
                  This device
                </p>
                <h2 className={styles.dialogTitle} id={mixesTitleId}>
                  Your mixes
                </h2>
              </div>
              <button
                aria-label="Close your mixes"
                className={styles.closeButton}
                onClick={() => closeDialog(mixesDialogRef.current)}
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </header>
            <p
              className={`text-body ${styles.dialogDescription}`}
              id={mixesDescriptionId}
            >
              Stored only in this browser, in their original creation order.
            </p>
            <ul className={styles.savedMixList}>
              {preferences?.savedMixes.map((mix) => {
                const sourceName = atmospheres.find(
                  ({ id }) => id === mix.sceneAtmosphereId,
                )?.name;
                return (
                  <li className={styles.savedMix} key={mix.id}>
                    <div>
                      <p className={styles.savedMixName}>{mix.name}</p>
                      <p className={styles.origin}>{sourceName}</p>
                    </div>
                    <div className={styles.savedMixActions}>
                      <button
                        aria-label={`Open ${mix.name}`}
                        className="text-label"
                        onClick={(event) =>
                          requestOpenMix(mix, event.currentTarget)
                        }
                        type="button"
                      >
                        Open
                      </button>
                      <button
                        aria-label={`Rename ${mix.name}`}
                        className="text-label"
                        onClick={(event) =>
                          openNameDialog(mix, event.currentTarget)
                        }
                        type="button"
                      >
                        <Pencil aria-hidden="true" size={14} /> Rename
                      </button>
                      <button
                        aria-label={`Delete ${mix.name}`}
                        className="text-label"
                        onClick={(event) => {
                          confirmationTriggerRef.current = event.currentTarget;
                          setConfirmation({
                            kind: "delete",
                            mixId: mix.id,
                            name: mix.name,
                          });
                          showDialog(confirmationDialogRef.current);
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </dialog>

        <dialog
          aria-describedby={confirmationDescriptionId}
          aria-labelledby={confirmationTitleId}
          className={styles.dialog}
          onClose={() => confirmationTriggerRef.current?.focus()}
          ref={confirmationDialogRef}
        >
          <div className={`${styles.dialogPanel} ${styles.compactPanel}`}>
            <h2 className={styles.dialogTitle} id={confirmationTitleId}>
              {confirmation?.kind === "delete"
                ? `Delete “${confirmation.name}”?`
                : "Discard unsaved changes?"}
            </h2>
            <p
              className={`text-body ${styles.dialogDescription}`}
              id={confirmationDescriptionId}
            >
              {confirmation?.kind === "delete"
                ? "This removes only the saved mix. No catalogue sounds are deleted."
                : "Your current draft changes will not be saved."}
            </p>
            <div className={styles.dialogActions}>
              <button
                className={`text-label ${styles.secondaryButton}`}
                onClick={() => closeDialog(confirmationDialogRef.current)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`text-label ${styles.dangerButton}`}
                onClick={confirmAction}
                type="button"
              >
                {confirmation?.kind === "delete"
                  ? "Delete mix"
                  : "Discard changes"}
              </button>
            </div>
          </div>
        </dialog>
      </FocusModeSurface>
    </AtmosphereScene>
  );
}
