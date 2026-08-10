import { describe, expect, it } from "vitest";

import { rainyApartment } from "./rainy-apartment";

type Rgb = { red: number; green: number; blue: number };

function parseHex(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);

  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
}

function relativeLuminance({ red, green, blue }: Rgb): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(parseHex(first));
  const secondLuminance = relativeLuminance(parseHex(second));
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("Rainy Apartment theme", () => {
  it.each([
    ["foreground", rainyApartment.theme.foreground],
    ["muted", rainyApartment.theme.muted],
    ["accent", rainyApartment.theme.accent],
    ["focus", rainyApartment.theme.focus],
  ])("keeps the %s color above normal-text AA contrast", (_, color) => {
    expect(
      contrastRatio(rainyApartment.theme.background, color),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
