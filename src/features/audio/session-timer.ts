export const SESSION_TIMER_DURATIONS = [15, 30, 45, 60, 90] as const;

export type SessionTimerDuration = (typeof SESSION_TIMER_DURATIONS)[number];

export type SessionTimerState =
  | { phase: "idle"; endsAt: null }
  | { phase: "active"; endsAt: number }
  | { phase: "ending"; endsAt: number };

export function isSessionTimerDuration(
  value: number,
): value is SessionTimerDuration {
  return SESSION_TIMER_DURATIONS.some((duration) => duration === value);
}

export function getTimerRemainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

export function formatTimerRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
