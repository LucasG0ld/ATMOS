"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Atmosphere } from "../../types/atmosphere";
import {
  allowsAudioPreload,
  createVisualPreloader,
  type BoundedVisualPreloader,
} from "../preloading/media-preloader";

import {
  createAudioEngine,
  type AudioEngineController,
  type AudioLoadResult,
} from "./audio-engine";
import styles from "./audio-session.module.css";
import {
  isSessionTimerDuration,
  type SessionTimerDuration,
  type SessionTimerState,
} from "./session-timer";

export type SessionPlaybackState =
  "idle" | "loading" | "playing" | "paused" | "ending" | "error";

type AudioSessionSnapshot = {
  playbackState: SessionPlaybackState;
  statusMessage: string;
  unavailableLayerIds: ReadonlySet<string>;
};

type AudioSessionController = AudioSessionSnapshot & {
  cancelTimer(): void;
  preloadAtmosphere(atmosphere: Atmosphere): void;
  selectAtmosphere(atmosphere: Atmosphere): void;
  setLayerVolume(layerId: string, volume: number): void;
  setTimer(durationMinutes: SessionTimerDuration): void;
  timer: SessionTimerState;
  timerAnnouncement: string;
  togglePlayback(
    atmosphere: Atmosphere,
    volumes: Readonly<Record<string, number>>,
  ): Promise<void>;
};

type AudioSessionProviderProps = {
  children: ReactNode;
  createEngine?: () => AudioEngineController;
  timerFadeMs?: number;
};

const EMPTY_LAYERS = new Set<string>();
const IDLE_TIMER: SessionTimerState = { endsAt: null, phase: "idle" };
const AudioSessionContext = createContext<AudioSessionController | null>(null);

function partialLayerMessage(result: AudioLoadResult): string {
  const count = result.unavailableLayerIds.length;
  if (count === 0) return "";
  return `${count === 1 ? "One sound layer is" : "Some sound layers are"} unavailable. Playback continues with the remaining audio.`;
}

function TransitionLayer({ atmosphere }: { atmosphere: Atmosphere }) {
  const { theme, visuals } = atmosphere;
  const style = {
    backgroundColor: theme.background,
    backgroundImage: `linear-gradient(${theme.overlay}, ${theme.overlay}), ${visuals.fallbackBackground}`,
    backgroundPosition: `${visuals.focalPoint.x}% ${visuals.focalPoint.y}%`,
  };

  return (
    <div
      aria-hidden="true"
      className={styles.transitionLayer}
      data-transition-from={atmosphere.id}
      style={style}
    >
      {visuals.backgroundSrc ? (
        <picture className={styles.transitionPicture}>
          {visuals.mobileBackgroundSrc ? (
            <source
              media="(max-width: 48rem)"
              srcSet={visuals.mobileBackgroundSrc}
            />
          ) : null}
          <img
            alt=""
            className={styles.transitionVisual}
            height={864}
            src={visuals.backgroundSrc}
            width={1536}
          />
        </picture>
      ) : null}
      <div className={styles.transitionVeil} />
    </div>
  );
}

export function AudioSessionProvider({
  children,
  createEngine = createAudioEngine,
  timerFadeMs = 5_000,
}: AudioSessionProviderProps) {
  const activeAtmosphereIdRef = useRef<string | undefined>(undefined);
  const currentAtmosphereRef = useRef<Atmosphere | undefined>(undefined);
  const engineRef = useRef<AudioEngineController | undefined>(undefined);
  const hasActivatedAudioRef = useRef(false);
  const intentPlayingRef = useRef(false);
  const operationRef = useRef(0);
  const unavailableLayerIdsRef = useRef<readonly string[]>([]);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const timerDeadlineRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const timerFinishRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const expireTimerRef = useRef<() => void>(() => undefined);
  const timerStateRef = useRef<SessionTimerState>(IDLE_TIMER);
  const visualPreloaderRef = useRef<BoundedVisualPreloader | undefined>(
    undefined,
  );
  const [outgoingAtmosphere, setOutgoingAtmosphere] = useState<
    Atmosphere | undefined
  >(undefined);
  const [snapshot, setSnapshot] = useState<AudioSessionSnapshot>({
    playbackState: "idle",
    statusMessage: "",
    unavailableLayerIds: EMPTY_LAYERS,
  });
  const [timer, setTimerState] = useState<SessionTimerState>(IDLE_TIMER);
  const [timerAnnouncement, setTimerAnnouncement] = useState("");

  const updateTimer = useCallback((nextTimer: SessionTimerState) => {
    timerStateRef.current = nextTimer;
    setTimerState(nextTimer);
  }, []);

  const clearTimerTimeouts = useCallback(() => {
    if (timerDeadlineRef.current !== undefined) {
      clearTimeout(timerDeadlineRef.current);
    }
    if (timerFinishRef.current !== undefined) {
      clearTimeout(timerFinishRef.current);
    }
    timerDeadlineRef.current = undefined;
    timerFinishRef.current = undefined;
  }, []);

  const finishTimer = useCallback(() => {
    timerFinishRef.current = undefined;
    updateTimer(IDLE_TIMER);
    setSnapshot((current) => ({
      ...current,
      playbackState: "paused",
      statusMessage: "Timer finished.",
    }));
  }, [updateTimer]);

  const armTimerFade = useCallback(
    (endsAt?: number) => {
      const effectiveEndsAt =
        endsAt ??
        (timerStateRef.current.phase === "active"
          ? timerStateRef.current.endsAt
          : undefined);
      if (!effectiveEndsAt || !intentPlayingRef.current) return;
      engineRef.current?.scheduleTimerFade(
        Math.max(0, effectiveEndsAt - Date.now()) / 1_000,
        timerFadeMs / 1_000,
      );
    },
    [timerFadeMs],
  );

  const expireTimer = useCallback(() => {
    const currentTimer = timerStateRef.current;
    if (currentTimer.phase !== "active") {
      return;
    }
    const remainingMs = currentTimer.endsAt - Date.now();
    if (remainingMs > 0) {
      timerDeadlineRef.current = setTimeout(
        () => expireTimerRef.current(),
        remainingMs,
      );
      return;
    }

    timerDeadlineRef.current = undefined;
    operationRef.current += 1;
    intentPlayingRef.current = false;
    const remainingFadeMs =
      engineRef.current?.fadeOutForTimer(timerFadeMs / 1_000) ?? 0;
    if (remainingFadeMs <= 0) {
      finishTimer();
      return;
    }

    updateTimer({ phase: "ending", endsAt: currentTimer.endsAt });
    setSnapshot((current) => ({
      ...current,
      playbackState: "ending",
      statusMessage: "Ending session…",
    }));
    timerFinishRef.current = setTimeout(finishTimer, remainingFadeMs);
  }, [finishTimer, timerFadeMs, updateTimer]);

  useEffect(() => {
    expireTimerRef.current = expireTimer;
  }, [expireTimer]);

  const setTimer = useCallback(
    (durationMinutes: SessionTimerDuration) => {
      if (
        !isSessionTimerDuration(durationMinutes) ||
        timerStateRef.current.phase === "ending"
      ) {
        return;
      }
      const replacesTimer = timerStateRef.current.phase === "active";
      clearTimerTimeouts();
      const endsAt = Date.now() + durationMinutes * 60_000;
      updateTimer({ phase: "active", endsAt });
      armTimerFade(endsAt);
      setTimerAnnouncement(
        `${replacesTimer ? "Timer replaced with" : "Timer set for"} ${durationMinutes} minutes.`,
      );
      timerDeadlineRef.current = setTimeout(
        expireTimer,
        durationMinutes * 60_000,
      );
    },
    [armTimerFade, clearTimerTimeouts, expireTimer, updateTimer],
  );

  const cancelTimer = useCallback(() => {
    if (timerStateRef.current.phase !== "active") return;
    clearTimerTimeouts();
    engineRef.current?.cancelTimerFade();
    updateTimer(IDLE_TIMER);
    setTimerAnnouncement("Timer canceled.");
  }, [clearTimerTimeouts, updateTimer]);

  const applyResult = useCallback((result: AudioLoadResult) => {
    unavailableLayerIdsRef.current = result.unavailableLayerIds;
    setSnapshot({
      playbackState: intentPlayingRef.current ? "playing" : "paused",
      statusMessage: partialLayerMessage(result),
      unavailableLayerIds: new Set(result.unavailableLayerIds),
    });
  }, []);

  const reportFailure = useCallback((operation: number, error: unknown) => {
    if (operation !== operationRef.current) return;
    if (error instanceof DOMException && error.name === "AbortError") return;
    intentPlayingRef.current = false;
    unavailableLayerIdsRef.current = [];
    engineRef.current?.pause();
    setSnapshot({
      playbackState: "error",
      statusMessage:
        "Audio could not be loaded for this atmosphere. Check your connection and retry.",
      unavailableLayerIds: EMPTY_LAYERS,
    });
  }, []);

  const reportBackgroundPlaybackFailure = useCallback(() => {
    if (!intentPlayingRef.current) return;
    intentPlayingRef.current = false;
    engineRef.current?.pause();
    setSnapshot((current) => ({
      ...current,
      playbackState: "paused",
      statusMessage:
        "Background playback was paused by your device. Press Play to resume.",
    }));
  }, []);

  const selectAtmosphere = useCallback(
    (atmosphere: Atmosphere) => {
      const previousAtmosphere = currentAtmosphereRef.current;
      if (previousAtmosphere?.id === atmosphere.id) return;
      currentAtmosphereRef.current = atmosphere;
      visualPreloaderRef.current?.cancel();

      if (previousAtmosphere) {
        if (transitionTimerRef.current) {
          clearTimeout(transitionTimerRef.current);
        }
        setOutgoingAtmosphere(previousAtmosphere);
        transitionTimerRef.current = setTimeout(
          () => setOutgoingAtmosphere(undefined),
          720,
        );
      }

      setSnapshot((current) => ({
        playbackState:
          current.playbackState === "error"
            ? activeAtmosphereIdRef.current
              ? "paused"
              : "idle"
            : current.playbackState,
        statusMessage: "",
        unavailableLayerIds: EMPTY_LAYERS,
      }));

      const engine = engineRef.current;
      if (
        !intentPlayingRef.current ||
        !engine ||
        !activeAtmosphereIdRef.current
      ) {
        return;
      }

      const operation = ++operationRef.current;
      setSnapshot({
        playbackState: "playing",
        statusMessage: `Changing to ${atmosphere.name}…`,
        unavailableLayerIds: EMPTY_LAYERS,
      });
      void engine
        .transition(atmosphere.sounds)
        .then((result) => {
          if (operation !== operationRef.current) return;
          activeAtmosphereIdRef.current = atmosphere.id;
          applyResult(result);
        })
        .catch((error: unknown) => reportFailure(operation, error));
    },
    [applyResult, reportFailure],
  );

  const preloadAtmosphere = useCallback((atmosphere: Atmosphere) => {
    if (currentAtmosphereRef.current?.id === atmosphere.id) return;
    visualPreloaderRef.current ??= createVisualPreloader();
    visualPreloaderRef.current.preload(atmosphere);

    const engine = engineRef.current;
    if (
      !hasActivatedAudioRef.current ||
      !engine ||
      !allowsAudioPreload(navigator)
    ) {
      return;
    }
    void engine.preload(atmosphere.sounds).catch(() => undefined);
  }, []);

  const togglePlayback = useCallback(
    async (
      atmosphere: Atmosphere,
      volumes: Readonly<Record<string, number>>,
    ) => {
      if (intentPlayingRef.current) {
        intentPlayingRef.current = false;
        engineRef.current?.pause();
        setSnapshot((current) => ({
          ...current,
          playbackState: "paused",
          statusMessage: "",
        }));
        return;
      }

      if (timerStateRef.current.phase === "ending") {
        clearTimerTimeouts();
        updateTimer(IDLE_TIMER);
        setTimerAnnouncement("Timer canceled.");
      }

      const operation = ++operationRef.current;
      setSnapshot({
        playbackState: "loading",
        statusMessage: "",
        unavailableLayerIds: EMPTY_LAYERS,
      });

      try {
        const engine = engineRef.current ?? createEngine();
        engineRef.current = engine;
        for (const sound of atmosphere.sounds) {
          engine.setLayerVolume(sound.id, (volumes[sound.id] ?? 0) / 100);
        }

        const result = activeAtmosphereIdRef.current
          ? activeAtmosphereIdRef.current === atmosphere.id
            ? {
                unavailableLayerIds: unavailableLayerIdsRef.current,
              }
            : await engine.transition(atmosphere.sounds)
          : await engine.load(atmosphere.sounds);
        if (operation !== operationRef.current) return;
        await engine.play();
        if (operation !== operationRef.current) return;

        activeAtmosphereIdRef.current = atmosphere.id;
        hasActivatedAudioRef.current = true;
        intentPlayingRef.current = true;
        armTimerFade();
        applyResult(result);
      } catch (error) {
        reportFailure(operation, error);
      }
    },
    [
      applyResult,
      armTimerFade,
      clearTimerTimeouts,
      createEngine,
      reportFailure,
      updateTimer,
    ],
  );

  const setLayerVolume = useCallback((layerId: string, volume: number) => {
    engineRef.current?.setLayerVolume(layerId, volume);
  }, []);

  useEffect(() => {
    const restoreVisiblePlayback = () => {
      expireTimer();
      void engineRef.current
        ?.setPageHidden(false)
        .then(() => armTimerFade())
        .catch(reportBackgroundPlaybackFailure);
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        restoreVisiblePlayback();
        return;
      }
      void engineRef.current?.setPageHidden(true).catch(() => undefined);
    };
    const handlePageShow = () => restoreVisiblePlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      operationRef.current += 1;
      clearTimerTimeouts();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      visualPreloaderRef.current?.cancel();
      const engine = engineRef.current;
      engineRef.current = undefined;
      if (engine) void engine.destroy().catch(() => undefined);
    };
  }, [
    armTimerFade,
    clearTimerTimeouts,
    expireTimer,
    reportBackgroundPlaybackFailure,
  ]);

  return (
    <AudioSessionContext.Provider
      value={{
        ...snapshot,
        cancelTimer,
        preloadAtmosphere,
        selectAtmosphere,
        setLayerVolume,
        setTimer,
        timer,
        timerAnnouncement,
        togglePlayback,
      }}
    >
      {children}
      {outgoingAtmosphere ? (
        <TransitionLayer
          atmosphere={outgoingAtmosphere}
          key={outgoingAtmosphere.id}
        />
      ) : null}
    </AudioSessionContext.Provider>
  );
}

export function useAudioSession(atmosphere?: Atmosphere) {
  const session = useContext(AudioSessionContext);
  useLayoutEffect(() => {
    if (atmosphere) session?.selectAtmosphere(atmosphere);
  }, [atmosphere, session]);
  return session;
}
