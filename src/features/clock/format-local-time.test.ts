import { describe, expect, it } from "vitest";

import { formatLocalTime, formatMachineTime } from "./format-local-time";

const evening = new Date(2026, 7, 10, 22, 7);

describe("local time formatting", () => {
  it("uses the requested locale for the visible value", () => {
    expect(formatLocalTime(evening, "en-GB")).toBe("22:07");
    expect(formatLocalTime(evening, "en-US")).toMatch(/10:07\sPM/i);
  });

  it("uses a stable 24-hour value for the datetime attribute", () => {
    expect(formatMachineTime(evening)).toBe("22:07");
  });
});
