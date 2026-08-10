import { describe, expect, it, vi } from "vitest";

import { deepForest } from "../../data/atmospheres/deep-forest";
import { fireplace } from "../../data/atmospheres/fireplace";

import { allowsAudioPreload, BoundedVisualPreloader } from "./media-preloader";

function createImage() {
  return {
    decoding: "auto" as const,
    fetchPriority: "auto" as const,
    removeAttribute: vi.fn(),
    src: "",
  };
}

describe("allowsAudioPreload", () => {
  it("blocks offline, Save-Data and connections classified as slow", () => {
    expect(allowsAudioPreload({ onLine: false })).toBe(false);
    expect(
      allowsAudioPreload({ onLine: true, connection: { saveData: true } }),
    ).toBe(false);
    expect(
      allowsAudioPreload({
        onLine: true,
        connection: { effectiveType: "2g" },
      }),
    ).toBe(false);
    expect(
      allowsAudioPreload({ onLine: true, connection: { downlink: 1 } }),
    ).toBe(false);
  });

  it("allows an unclassified or sufficiently fast connection", () => {
    expect(allowsAudioPreload({ onLine: true })).toBe(true);
    expect(
      allowsAudioPreload({
        onLine: true,
        connection: { downlink: 5, effectiveType: "4g" },
      }),
    ).toBe(true);
  });
});

describe("BoundedVisualPreloader", () => {
  it("keeps one responsive visual target and cancels the previous one", () => {
    const images: ReturnType<typeof createImage>[] = [];
    const preloader = new BoundedVisualPreloader({
      createImage: () => {
        const image = createImage();
        images.push(image);
        return image;
      },
      matchesMobile: () => true,
    });

    preloader.preload(deepForest);
    preloader.preload(deepForest);
    expect(images).toHaveLength(1);
    expect(images[0].src).toContain("deep-forest-mobile.webp");

    preloader.preload(fireplace);
    expect(images).toHaveLength(2);
    expect(images[0].removeAttribute).toHaveBeenCalledWith("src");
    expect(images[1].src).toContain("fireplace-mobile.webp");

    preloader.cancel();
    expect(images[1].removeAttribute).toHaveBeenCalledWith("src");
  });
});
