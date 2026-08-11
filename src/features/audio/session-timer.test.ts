import { describe, expect, it } from "vitest";

import {
  formatTimerRemaining,
  getTimerRemainingMs,
  isSessionTimerDuration,
  SESSION_TIMER_DURATIONS,
} from "./session-timer";

describe("session timer helpers", () => {
  it("exposes only the five approved durations", () => {
    expect(SESSION_TIMER_DURATIONS).toEqual([15, 30, 45, 60, 90]);
    expect(SESSION_TIMER_DURATIONS.every(isSessionTimerDuration)).toBe(true);
    expect(isSessionTimerDuration(20)).toBe(false);
  });

  it("derives a bounded countdown from an absolute deadline", () => {
    expect(getTimerRemainingMs(91_000, 1_000)).toBe(90_000);
    expect(getTimerRemainingMs(1_000, 91_000)).toBe(0);
    expect(formatTimerRemaining(90_001)).toBe("01:31");
    expect(formatTimerRemaining(0)).toBe("00:00");
  });
});
