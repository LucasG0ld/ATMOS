import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { rainyApartment } from "../../data/atmospheres/rainy-apartment";
import { deepForest } from "../../data/atmospheres/deep-forest";

import { AtmosphereScene } from "./atmosphere-scene";

describe("AtmosphereScene", () => {
  it("applies atmosphere tokens and keeps decorative layers hidden", () => {
    const { container } = render(
      <AtmosphereScene atmosphere={rainyApartment}>
        <main>Scene content</main>
      </AtmosphereScene>,
    );
    const scene = container.querySelector<HTMLElement>(
      '[data-atmosphere="rainy-apartment"]',
    );

    expect(scene).not.toBeNull();
    expect(scene).toHaveStyle({
      "--atmos-background": rainyApartment.theme.background,
      "--atmos-foreground": rainyApartment.theme.foreground,
    });
    expect(scene?.querySelector("[data-atmosphere-visual]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(scene?.querySelector('[class*="rain"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(scene).toHaveTextContent("Scene content");
  });

  it("renders responsive visual media over the CSS fallback", () => {
    const { container } = render(
      <AtmosphereScene atmosphere={deepForest}>
        <main>Forest content</main>
      </AtmosphereScene>,
    );
    const picture = container.querySelector("picture");
    const source = picture?.querySelector("source");
    const visual = picture?.querySelector("img");

    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(source).toHaveAttribute(
      "srcset",
      "/images/atmospheres/deep-forest-mobile.webp",
    );
    expect(source).toHaveAttribute("media", "(max-width: 48rem)");
    expect(visual).toHaveAttribute(
      "src",
      "/images/atmospheres/deep-forest-desktop.webp",
    );
    expect(visual).toHaveAttribute("alt", "");
    expect(visual).toHaveAttribute("fetchpriority", "high");
  });
});
