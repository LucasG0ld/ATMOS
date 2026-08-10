import { describe, expect, it } from "vitest";

import { getTimeGreeting } from "./get-time-greeting";

function atLocalTime(hours: number, minutes = 0): Date {
  const date = new Date(2026, 7, 10, hours, minutes);
  return date;
}

describe("getTimeGreeting", () => {
  it.each([
    [5, 0, "Good morning."],
    [11, 59, "Good morning."],
    [12, 0, "Good afternoon."],
    [17, 59, "Good afternoon."],
    [18, 0, "Good evening."],
    [4, 59, "Good evening."],
  ] as const)("returns %s:%s as %s", (hours, minutes, expectedGreeting) => {
    expect(getTimeGreeting(atLocalTime(hours, minutes))).toBe(expectedGreeting);
  });
});
