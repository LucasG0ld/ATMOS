import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { rainyApartment } from "../../data/atmospheres/rainy-apartment";

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
    expect(scene?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
    expect(scene).toHaveTextContent("Scene content");
  });
});
