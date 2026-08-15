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

  it("provides a concise mobile catalogue description", () => {
    for (const atmosphere of atmospheres) {
      expect(atmosphere.catalogueDescription.length).toBeGreaterThan(0);
      expect(atmosphere.catalogueDescription.length).toBeLessThanOrEqual(64);
    }
  });

  it("provides paired responsive visuals for every atmosphere", () => {
    for (const atmosphere of atmospheres) {
      expect(atmosphere.visuals.backgroundSrc).toMatch(
        new RegExp(`/images/atmospheres/${atmosphere.slug}-desktop\\.webp$`),
      );
      expect(atmosphere.visuals.mobileBackgroundSrc).toMatch(
        new RegExp(`/images/atmospheres/${atmosphere.slug}-mobile\\.webp$`),
      );
      expect(atmosphere.visuals.mobileFocalPoint).toBeDefined();
    }
  });

  it("provides three independently mixed local layers for every atmosphere", () => {
    for (const atmosphere of atmospheres) {
      expect(atmosphere.sounds).toHaveLength(3);
      expect(new Set(atmosphere.sounds.map(({ id }) => id)).size).toBe(3);

      for (const sound of atmosphere.sounds) {
        expect(sound.src).toMatch(new RegExp(`/audio/${sound.id}\\.mp3$`));
        expect(sound.defaultVolume).toBeGreaterThan(0);
        expect(sound.defaultVolume).toBeLessThanOrEqual(0.65);
      }
    }
  });
});
