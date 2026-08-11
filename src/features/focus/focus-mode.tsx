"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "./focus-mode.module.css";

type FocusModeController = {
  enterFocus(trigger: HTMLElement): void;
  exitFocus(): void;
  isFocusMode: boolean;
};

const FocusModeContext = createContext<FocusModeController | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusTimerRef = useRef<number | undefined>(undefined);

  const enterFocus = useCallback((trigger: HTMLElement) => {
    if (restoreFocusTimerRef.current !== undefined) {
      window.clearTimeout(restoreFocusTimerRef.current);
      restoreFocusTimerRef.current = undefined;
    }
    returnFocusRef.current = trigger;
    setIsFocusMode(true);
  }, []);

  const exitFocus = useCallback(() => {
    setIsFocusMode(false);
    restoreFocusTimerRef.current = window.setTimeout(() => {
      restoreFocusTimerRef.current = undefined;
      const previousTrigger = returnFocusRef.current;
      const currentTrigger = document.querySelector<HTMLElement>(
        "[data-focus-trigger]",
      );
      const playbackFallback = document.querySelector<HTMLElement>(
        "[data-focus-playback]",
      );
      (
        (previousTrigger?.isConnected ? previousTrigger : currentTrigger) ??
        playbackFallback
      )?.focus();
    }, 0);
  }, []);

  useEffect(
    () => () => {
      if (restoreFocusTimerRef.current !== undefined) {
        window.clearTimeout(restoreFocusTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isFocusMode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      exitFocus();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [exitFocus, isFocusMode]);

  return (
    <FocusModeContext.Provider value={{ enterFocus, exitFocus, isFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function FocusModeSurface({ children }: { children: ReactNode }) {
  const focusMode = useFocusMode();
  const exitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusMode.isFocusMode) exitButtonRef.current?.focus();
  }, [focusMode.isFocusMode]);

  return (
    <div
      className={styles.surface}
      data-focus-mode={focusMode.isFocusMode ? "true" : "false"}
    >
      {focusMode.isFocusMode ? (
        <button
          className={`text-label ${styles.exitButton}`}
          onClick={focusMode.exitFocus}
          ref={exitButtonRef}
          type="button"
        >
          Exit focus
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function FocusModeSecondary({ children }: { children: ReactNode }) {
  const focusMode = useFocusMode();
  return focusMode.isFocusMode ? null : children;
}

export function useOptionalFocusMode() {
  return useContext(FocusModeContext);
}

function useFocusMode() {
  const focusMode = useOptionalFocusMode();
  if (!focusMode) {
    throw new Error("Focus Mode must be used within FocusModeProvider.");
  }
  return focusMode;
}
