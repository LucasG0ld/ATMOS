import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { atmospheres } from "../../data/atmospheres";
import { PreferencesProvider } from "../../features/preferences/preferences-provider";
import type { PreferencesStorageAdapter } from "../../features/preferences/preferences-storage";

import { AtmosphereCatalogue } from "./atmosphere-catalogue";

describe("AtmosphereCatalogue", () => {
  afterEach(() => vi.useRealTimers());

  it("starts with Rainy Apartment and previews a focused destination", () => {
    render(<AtmosphereCatalogue atmospheres={atmospheres} />);

    expect(screen.getByText(/Four places/)).toHaveTextContent(
      "Four placesone quiet moment",
    );
    expect(document.querySelector('[data-atmosphere="rainy-apartment"]')).toBe(
      document.querySelector("[data-atmosphere]"),
    );

    fireEvent.focus(screen.getByRole("link", { name: /Deep Forest/i }));

    expect(document.querySelector('[data-atmosphere="deep-forest"]')).toBe(
      document.querySelector("[data-atmosphere]"),
    );
    expect(screen.getByRole("link", { name: /Deep Forest/i })).toHaveAttribute(
      "data-preview-active",
      "true",
    );
  });

  it("waits for pointer intent and keeps the last preview on exit", () => {
    vi.useFakeTimers();
    render(<AtmosphereCatalogue atmospheres={atmospheres} />);
    const fireplaceLink = screen.getByRole("link", { name: /Fireplace/i });

    fireEvent.pointerEnter(fireplaceLink, { pointerType: "mouse" });
    expect(document.querySelector('[data-atmosphere="rainy-apartment"]')).toBe(
      document.querySelector("[data-atmosphere]"),
    );

    act(() => vi.advanceTimersByTime(100));
    fireEvent.pointerLeave(fireplaceLink, { pointerType: "mouse" });

    expect(document.querySelector('[data-atmosphere="fireplace"]')).toBe(
      document.querySelector("[data-atmosphere]"),
    );
  });

  it("marks favorites without changing catalogue order", () => {
    const adapter: PreferencesStorageAdapter = {
      read: vi.fn().mockReturnValue({
        preferences: {
          favoriteAtmosphereIds: ["deep-forest"],
          layerVolumes: {},
        },
        storageAvailable: true,
      }),
      reset: vi.fn().mockReturnValue(true),
      write: vi.fn().mockReturnValue(true),
    };
    render(
      <PreferencesProvider catalogue={[]} storageAdapter={adapter}>
        <AtmosphereCatalogue atmospheres={atmospheres} />
      </PreferencesProvider>,
    );

    const links = screen
      .getByRole("navigation", { name: "Atmospheres" })
      .getElementsByTagName("a");
    expect(Array.from(links, (link) => link.getAttribute("href"))).toEqual([
      "/atmosphere/rainy-apartment",
      "/atmosphere/quiet-coffee-shop",
      "/atmosphere/deep-forest",
      "/atmosphere/fireplace",
    ]);
    expect(
      screen.getByRole("link", { name: /Deep Forest.*Saved/i }),
    ).toBeVisible();
    expect(
      screen
        .getAllByText("Saved")
        .filter((marker) => marker.dataset.saved === "true"),
    ).toHaveLength(1);
  });
});
