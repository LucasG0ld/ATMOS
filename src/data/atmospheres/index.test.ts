import { describe, expect, it } from "vitest";

import {
  atmospheres,
  deepForest,
  fireplace,
  getAtmosphereBySlug,
  quietCoffeeShop,
  rainyApartment,
} from "./index";

describe("atmosphere catalog", () => {
  it("resolves a known atmosphere from its slug", () => {
    expect(getAtmosphereBySlug("rainy-apartment")).toBe(rainyApartment);
    expect(getAtmosphereBySlug("quiet-coffee-shop")).toBe(quietCoffeeShop);
    expect(getAtmosphereBySlug("deep-forest")).toBe(deepForest);
    expect(getAtmosphereBySlug("fireplace")).toBe(fireplace);
  });

  it("keeps the approved editorial order", () => {
    expect(atmospheres.map(({ slug }) => slug)).toEqual([
      "rainy-apartment",
      "quiet-coffee-shop",
      "deep-forest",
      "fireplace",
    ]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getAtmosphereBySlug("unknown-room")).toBeUndefined();
  });

  it("keeps ids and slugs unique", () => {
    const ids = atmospheres.map(({ id }) => id);
    const slugs = atmospheres.map(({ slug }) => slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
