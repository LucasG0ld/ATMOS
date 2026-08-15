"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  Focus,
  Heart,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  createAudioEngine,
  type AudioEngineController,
} from "../../features/audio/audio-engine";
import { useAudioSession } from "../../features/audio/audio-session";
import { useOptionalPreferences } from "../../features/preferences/preferences-provider";
import { useOptionalFocusMode } from "../../features/focus/focus-mode";
import type { Atmosphere, SoundLayer } from "../../types/atmosphere";

import { AtmosSlider } from "./atmos-slider";
import { SessionTimerControl } from "./session-timer-control";
import styles from "./visual-controls.module.css";

type VisualControlsProps = {
  atmosphere?: Atmosphere;
  atmosphereName: string;
  createEngine?: () => AudioEngineController;
  sounds: readonly SoundLayer[];
};

type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";

function createInitialVolumes(
  sounds: readonly SoundLayer[],
): Record<string, number> {
  return Object.fromEntries(
    sounds.map((sound) => [sound.id, Math.round(sound.defaultVolume * 100)]),
  );
}

export function VisualControls({
  atmosphere,
  atmosphereName,
  createEngine = createAudioEngine,
  sounds,
}: VisualControlsProps) {
  const session = useAudioSession(atmosphere);
  const preferences = useOptionalPreferences();
  const focusMode = useOptionalFocusMode();
  const focusTriggerRef = useRef<HTMLButtonElement>(null);
  const engineRef = useRef<AudioEngineController | null>(null);
  const operationRef = useRef(0);
  const statusId = useId();
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [unavailableLayers, setUnavailableLayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [localVolumes, setLocalVolumes] = useState<Record<string, number>>(() =>
    createInitialVolumes(sounds),
  );
  const volumes = useMemo(() => {
    if (!atmosphere || !preferences?.isHydrated) return localVolumes;
    const storedVolumes = preferences.layerVolumes[atmosphere.id];
    return Object.fromEntries(
      sounds.map((sound) => [
        sound.id,
        Math.round((storedVolumes?.[sound.id] ?? sound.defaultVolume) * 100),
      ]),
    );
  }, [atmosphere, localVolumes, preferences, sounds]);
  const currentPlaybackState = session?.playbackState ?? playbackState;
  const currentStatusMessage = session?.statusMessage ?? statusMessage;
  const currentUnavailableLayers =
    session?.unavailableLayerIds ?? unavailableLayers;
  const hasSounds = sounds.length > 0;
  const isPlaying = currentPlaybackState === "playing";
  const isFavorite = Boolean(
    atmosphere && preferences?.favoriteAtmosphereIds.includes(atmosphere.id),
  );
  const action = !hasSounds
    ? "Unavailable"
    : currentPlaybackState === "loading"
      ? "Loading"
      : currentPlaybackState === "error"
        ? "Retry"
        : isPlaying
          ? "Pause"
          : "Play";
  const ActionIcon =
    currentPlaybackState === "loading"
      ? LoaderCircle
      : currentPlaybackState === "error"
        ? RotateCcw
        : isPlaying
          ? Pause
          : Play;

  useEffect(() => {
    const handleVisibilityChange = () => {
      const engine = engineRef.current;
      if (engine) void engine.setPageHidden(document.hidden).catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      operationRef.current += 1;
      const engine = engineRef.current;
      engineRef.current = null;
      if (engine) void engine.destroy().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!atmosphere || !preferences?.isHydrated) return;

    for (const sound of sounds) {
      const volume = (volumes[sound.id] ?? 0) / 100;
      if (session) session.setLayerVolume(sound.id, volume);
      else engineRef.current?.setLayerVolume(sound.id, volume);
    }
  }, [atmosphere, preferences?.isHydrated, session, sounds, volumes]);

  const updateVolume = (soundId: string, value: number) => {
    setLocalVolumes((currentVolumes) => ({
      ...currentVolumes,
      [soundId]: value,
    }));
    if (atmosphere && preferences?.isHydrated) {
      preferences.setLayerVolume(atmosphere.id, soundId, value / 100);
    }
    if (session) {
      session.setLayerVolume(soundId, value / 100);
    } else {
      engineRef.current?.setLayerVolume(soundId, value / 100);
    }
  };

  const togglePlayback = async () => {
    if (!hasSounds || currentPlaybackState === "loading") return;

    if (session && atmosphere) {
      await session.togglePlayback(atmosphere, volumes);
      return;
    }

    if (currentPlaybackState === "playing") {
      engineRef.current?.pause();
      setPlaybackState("paused");
      return;
    }

    const operation = ++operationRef.current;
    setPlaybackState("loading");
    setStatusMessage("");

    try {
      const engine = engineRef.current ?? createEngine();
      engineRef.current = engine;
      const result = await engine.load(sounds);
      for (const sound of sounds) {
        engine.setLayerVolume(sound.id, (volumes[sound.id] ?? 0) / 100);
      }
      await engine.play();
      if (operation !== operationRef.current) return;

      const unavailable = new Set(result.unavailableLayerIds);
      setUnavailableLayers(unavailable);
      setStatusMessage(
        unavailable.size > 0
          ? `${unavailable.size === 1 ? "One sound layer is" : "Some sound layers are"} unavailable. Playback continues with the remaining audio.`
          : "",
      );
      setPlaybackState("playing");
    } catch {
      if (operation !== operationRef.current) return;
      setUnavailableLayers(new Set());
      setStatusMessage(
        "Audio could not be loaded. Check your connection and retry.",
      );
      setPlaybackState("error");
    }
  };

  return (
    <div
      className={styles.controls}
      data-focus-controls={focusMode?.isFocusMode ? "true" : "false"}
    >
      <div className={styles.actions}>
        <MotionConfig reducedMotion="user">
          <button
            aria-busy={currentPlaybackState === "loading"}
            aria-describedby={currentStatusMessage ? statusId : undefined}
            aria-label={
              hasSounds
                ? `${action} ${atmosphereName}`
                : `Audio unavailable for ${atmosphereName}`
            }
            className={styles.playButton}
            data-focus-playback=""
            disabled={!hasSounds || currentPlaybackState === "loading"}
            data-playing={isPlaying ? "true" : "false"}
            onClick={() => void togglePlayback()}
            type="button"
          >
            <span className={styles.buttonContent}>
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  aria-hidden="true"
                  exit={{ opacity: 0, scale: 0.92 }}
                  initial={{ opacity: 0, scale: 0.92 }}
                  className={`${styles.buttonIcon} ${currentPlaybackState === "loading" ? styles.loadingIcon : ""}`}
                  key={action}
                  transition={{ duration: 0.16 }}
                >
                  <ActionIcon fill="currentColor" size={16} strokeWidth={1.5} />
                </motion.span>
              </AnimatePresence>
              <span>{action}</span>
            </span>
          </button>
        </MotionConfig>
      </div>

      {currentStatusMessage ? (
        <p
          className={`text-label ${styles.status}`}
          id={statusId}
          role={
            currentPlaybackState === "error"
              ? "alert"
              : currentPlaybackState === "ending"
                ? undefined
                : "status"
          }
        >
          {currentStatusMessage}
        </p>
      ) : null}

      {!focusMode?.isFocusMode ? (
        <fieldset className={styles.fieldset}>
          <legend className={`text-label ${styles.legend}`}>
            Sound layers
          </legend>
          <div className={styles.layers}>
            {hasSounds ? (
              sounds.map((sound) => (
                <AtmosSlider
                  key={sound.id}
                  disabled={
                    currentUnavailableLayers.has(sound.id) ||
                    Boolean(preferences && !preferences.isHydrated)
                  }
                  label={sound.name}
                  onValueChange={(value) => updateVolume(sound.id, value)}
                  value={volumes[sound.id] ?? 0}
                />
              ))
            ) : (
              <p className={`text-body ${styles.audioPending}`}>
                Sound layers are being prepared for this atmosphere.
              </p>
            )}
          </div>
        </fieldset>
      ) : null}

      {(atmosphere && preferences) || session ? (
        <div className={styles.personalActions}>
          {atmosphere && preferences && !focusMode?.isFocusMode ? (
            <button
              aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
              aria-pressed={isFavorite}
              className={styles.favoriteButton}
              disabled={!preferences.isHydrated}
              onClick={() =>
                preferences.setFavorite(atmosphere.id, !isFavorite)
              }
              type="button"
            >
              <Heart
                aria-hidden="true"
                fill={isFavorite ? "currentColor" : "none"}
                size={15}
                strokeWidth={1.5}
              />
              <span>{isFavorite ? "Saved" : "Favorite"}</span>
            </button>
          ) : null}
          {session ? <SessionTimerControl /> : null}
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
      ) : null}
    </div>
  );
}
