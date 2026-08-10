import { describe, expect, it } from "vitest";

import { defineAtmosphere } from "./define-atmosphere";
import { rainyApartment } from "./rainy-apartment";

describe("defineAtmosphere", () => {
  it("accepts the Rainy Apartment definition", () => {
    expect(rainyApartment.slug).toBe("rainy-apartment");
    expect(rainyApartment.sounds).toHaveLength(3);
  });

  it("accepts an empty sound list while an atmosphere audio is in preparation", () => {
    expect(
      defineAtmosphere({ ...rainyApartment, sounds: [] }).sounds,
    ).toHaveLength(0);
  });

  it("rejects an invalid slug", () => {
    expect(() =>
      defineAtmosphere({ ...rainyApartment, slug: "Rainy Apartment" }),
    ).toThrow('Invalid atmosphere: invalid slug "Rainy Apartment"');
  });

  it("rejects duplicate sound identifiers", () => {
    expect(() =>
      defineAtmosphere({
        ...rainyApartment,
        sounds: [rainyApartment.sounds[0], rainyApartment.sounds[0]],
      }),
    ).toThrow('Invalid atmosphere: duplicate sound id "rain"');
  });

  it("rejects volume values outside the audio domain", () => {
    expect(() =>
      defineAtmosphere({
        ...rainyApartment,
        sounds: [
          {
            ...rainyApartment.sounds[0],
            defaultVolume: 1.2,
          },
        ],
      }),
    ).toThrow('sound "rain" volume must be between 0 and 1');
  });
});
