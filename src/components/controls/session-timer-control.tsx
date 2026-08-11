"use client";

import { Timer, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useAudioSession } from "../../features/audio/audio-session";
import {
  formatTimerRemaining,
  getTimerRemainingMs,
  SESSION_TIMER_DURATIONS,
  type SessionTimerDuration,
} from "../../features/audio/session-timer";

import styles from "./session-timer-control.module.css";

export function SessionTimerControl() {
  const session = useAudioSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [now, setNow] = useState(() => Date.now());
  const activeEndsAt =
    session?.timer.phase === "active" ? session.timer.endsAt : null;

  useEffect(() => {
    if (activeEndsAt === null) return;
    let tickTimer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime < activeEndsAt) {
        tickTimer = setTimeout(tick, 1_000);
      }
    };
    tickTimer = setTimeout(tick, 0);
    return () => {
      if (tickTimer !== undefined) clearTimeout(tickTimer);
    };
  }, [activeEndsAt]);

  if (!session) return null;

  const remaining =
    session.timer.phase === "active"
      ? formatTimerRemaining(getTimerRemainingMs(session.timer.endsAt, now))
      : null;
  const triggerText =
    session.timer.phase === "ending"
      ? "Ending session…"
      : remaining
        ? `Timer · ${remaining}`
        : "Timer";

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => dialogRef.current?.close();

  const startTimer = (duration: SessionTimerDuration) => {
    session.setTimer(duration);
    closeDialog();
  };

  const cancelTimer = () => {
    session.cancelTimer();
    closeDialog();
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={`text-label ${styles.trigger}`}
        disabled={session.timer.phase === "ending"}
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <Timer aria-hidden="true" size={15} strokeWidth={1.5} />
        <span>{triggerText}</span>
      </button>

      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className={styles.dialog}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 className={`font-normal ${styles.title}`} id={titleId}>
              Set a timer
            </h2>
            <button
              aria-label="Close timer"
              className={styles.closeButton}
              onClick={closeDialog}
              type="button"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.5} />
            </button>
          </header>

          <p className={`text-body ${styles.description}`} id={descriptionId}>
            {session.timer.phase === "ending"
              ? "Ending session…"
              : remaining
                ? `Ends in ${remaining}. Choosing another duration replaces the current timer.`
                : "Choose how long this session should last."}
          </p>

          <div className={styles.durations}>
            {SESSION_TIMER_DURATIONS.map((duration) => (
              <button
                aria-label={`${duration} minutes`}
                className={styles.durationButton}
                disabled={session.timer.phase === "ending"}
                key={duration}
                onClick={() => startTimer(duration)}
                type="button"
              >
                <span className={styles.durationValue}>{duration}</span>
                <span className={`text-label ${styles.durationUnit}`}>
                  minutes
                </span>
              </button>
            ))}
          </div>

          {session.timer.phase === "active" ? (
            <button
              className={`text-label ${styles.cancelButton}`}
              onClick={cancelTimer}
              type="button"
            >
              Cancel timer
            </button>
          ) : null}
        </div>
      </dialog>

      <p aria-live="polite" className={styles.announcement}>
        {session.timerAnnouncement}
      </p>
    </>
  );
}
