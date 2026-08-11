import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type PreferenceCatalogueEntry,
  type PreferencesStorageAdapter,
} from "./preferences-storage";
import { PreferencesProvider, usePreferences } from "./preferences-provider";

const catalogue = [
  { atmosphereId: "rainy-apartment", soundLayerIds: ["rain", "thunder"] },
  { atmosphereId: "deep-forest", soundLayerIds: ["forest-air"] },
] as const satisfies readonly PreferenceCatalogueEntry[];

function createAdapter(
  overrides: Partial<PreferencesStorageAdapter> = {},
): PreferencesStorageAdapter {
  return {
    read: vi.fn().mockReturnValue({
      preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
      storageAvailable: true,
    }),
    reset: vi.fn().mockReturnValue(true),
    write: vi.fn().mockReturnValue(true),
    ...overrides,
  };
}

function Probe() {
  const preferences = usePreferences();
  return (
    <div>
      <output aria-label="Hydrated">{String(preferences.isHydrated)}</output>
      <output aria-label="Persistence">{preferences.persistenceStatus}</output>
      <output aria-label="Favorites">
        {preferences.favoriteAtmosphereIds.join(",")}
      </output>
      <output aria-label="Rain volume">
        {preferences.layerVolumes["rainy-apartment"]?.rain ?? "default"}
      </output>
      <button onClick={() => preferences.setFavorite("rainy-apartment", true)}>
        Favorite rain
      </button>
      <button
        onClick={() =>
          preferences.setLayerVolume("rainy-apartment", "rain", 0.35)
        }
      >
        Set rain
      </button>
      <button
        onClick={() => preferences.setLayerVolume("unknown", "rain", 0.9)}
      >
        Set unknown
      </button>
      <button onClick={preferences.resetPreferences}>Reset</button>
    </div>
  );
}

describe("PreferencesProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("does not read browser storage during server rendering", () => {
    const adapter = createAdapter();

    expect(
      renderToString(
        <PreferencesProvider catalogue={catalogue} storageAdapter={adapter}>
          <span>Server content</span>
        </PreferencesProvider>,
      ),
    ).toContain("Server content");
    expect(adapter.read).not.toHaveBeenCalled();
  });

  it("hydrates a validated snapshot without writing it back", () => {
    const adapter = createAdapter({
      read: vi.fn().mockReturnValue({
        preferences: {
          favoriteAtmosphereIds: ["deep-forest"],
          layerVolumes: { "rainy-apartment": { rain: 0.7 } },
        },
        storageAvailable: true,
      }),
    });

    render(
      <PreferencesProvider catalogue={catalogue} storageAdapter={adapter}>
        <Probe />
      </PreferencesProvider>,
    );

    expect(screen.getByLabelText("Hydrated")).toHaveTextContent("true");
    expect(screen.getByLabelText("Persistence")).toHaveTextContent("available");
    expect(screen.getByLabelText("Favorites")).toHaveTextContent("deep-forest");
    expect(screen.getByLabelText("Rain volume")).toHaveTextContent("0.7");
    expect(adapter.write).not.toHaveBeenCalled();
  });

  it("reads the default local store without network or audio side effects", () => {
    const fetchSpy = vi.fn();
    const audioContextSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("AudioContext", audioContextSpy);

    render(
      <PreferencesProvider catalogue={catalogue}>
        <Probe />
      </PreferencesProvider>,
    );

    expect(screen.getByLabelText("Hydrated")).toHaveTextContent("true");
    expect(screen.getByLabelText("Persistence")).toHaveTextContent("available");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(audioContextSpy).not.toHaveBeenCalled();
  });

  it("keeps updates in memory and coalesces them into one write", () => {
    vi.useFakeTimers();
    const adapter = createAdapter();
    render(
      <PreferencesProvider
        catalogue={catalogue}
        storageAdapter={adapter}
        writeDelayMs={250}
      >
        <Probe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Favorite rain" }));
    fireEvent.click(screen.getByRole("button", { name: "Set rain" }));
    fireEvent.click(screen.getByRole("button", { name: "Set unknown" }));

    expect(screen.getByLabelText("Favorites")).toHaveTextContent(
      "rainy-apartment",
    );
    expect(screen.getByLabelText("Rain volume")).toHaveTextContent("0.35");
    expect(adapter.write).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(250));

    expect(adapter.write).toHaveBeenCalledTimes(1);
    expect(adapter.write).toHaveBeenCalledWith({
      favoriteAtmosphereIds: ["rainy-apartment"],
      layerVolumes: { "rainy-apartment": { rain: 0.35 } },
    });
  });

  it("resets memory and cancels a pending write", () => {
    vi.useFakeTimers();
    const adapter = createAdapter();
    render(
      <PreferencesProvider catalogue={catalogue} storageAdapter={adapter}>
        <Probe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Favorite rain" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    act(() => vi.runAllTimers());

    expect(screen.getByLabelText("Favorites")).toBeEmptyDOMElement();
    expect(adapter.reset).toHaveBeenCalledTimes(1);
    expect(adapter.write).not.toHaveBeenCalled();
  });

  it("flushes one pending snapshot when the provider unmounts", () => {
    vi.useFakeTimers();
    const adapter = createAdapter();
    const view = render(
      <PreferencesProvider catalogue={catalogue} storageAdapter={adapter}>
        <Probe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Favorite rain" }));
    view.unmount();

    expect(adapter.write).toHaveBeenCalledTimes(1);
    expect(adapter.write).toHaveBeenCalledWith({
      favoriteAtmosphereIds: ["rainy-apartment"],
      layerVolumes: {},
    });
  });

  it("reports unavailable persistence while preserving memory state", () => {
    vi.useFakeTimers();
    const adapter = createAdapter({
      read: vi.fn().mockReturnValue({
        preferences: { favoriteAtmosphereIds: [], layerVolumes: {} },
        storageAvailable: false,
      }),
      write: vi.fn().mockReturnValue(false),
    });
    render(
      <PreferencesProvider
        catalogue={catalogue}
        storageAdapter={adapter}
        writeDelayMs={1}
      >
        <Probe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Favorite rain" }));
    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByLabelText("Favorites")).toHaveTextContent(
      "rainy-apartment",
    );
    expect(screen.getByLabelText("Persistence")).toHaveTextContent(
      "unavailable",
    );
  });
});
