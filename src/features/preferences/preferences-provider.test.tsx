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
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
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
      <output aria-label="Mixes">
        {preferences.savedMixes.map(({ name }) => name).join(",")}
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
      <button
        onClick={() =>
          preferences.createMix({
            name: "Rain and trees",
            sceneAtmosphereId: "rainy-apartment",
            layers: [
              {
                sound: {
                  atmosphereId: "rainy-apartment",
                  layerId: "rain",
                },
                volume: 0.6,
              },
              {
                sound: { atmosphereId: "deep-forest", layerId: "forest-air" },
                volume: 0.3,
              },
            ],
          })
        }
      >
        Create mix
      </button>
      <button
        onClick={() =>
          preferences.updateMix("mix-1", {
            name: "Updated mix",
            sceneAtmosphereId: "rainy-apartment",
            layers: [
              {
                sound: {
                  atmosphereId: "rainy-apartment",
                  layerId: "rain",
                },
                volume: 0.5,
              },
            ],
          })
        }
      >
        Update mix
      </button>
      <button onClick={() => preferences.deleteMix("mix-1")}>Delete mix</button>
    </div>
  );
}

function MixLimitProbe() {
  const preferences = usePreferences();
  return (
    <div>
      <output aria-label="Mix count">{preferences.savedMixes.length}</output>
      <button
        onClick={() => {
          for (let index = 0; index < 21; index += 1) {
            preferences.createMix({
              name: `Mix ${index}`,
              sceneAtmosphereId: "rainy-apartment",
              layers: [
                {
                  sound: {
                    atmosphereId: "rainy-apartment",
                    layerId: "rain",
                  },
                  volume: 0.5,
                },
              ],
            });
          }
        }}
      >
        Fill mixes
      </button>
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
          savedMixes: [],
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
      savedMixes: [],
    });
  });

  it("creates, updates and deletes validated mixes with stable IDs", () => {
    vi.useFakeTimers();
    const adapter = createAdapter();
    render(
      <PreferencesProvider
        catalogue={catalogue}
        createMixId={() => "mix-1"}
        storageAdapter={adapter}
        writeDelayMs={1}
      >
        <Probe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create mix" }));
    fireEvent.click(screen.getByRole("button", { name: "Create mix" }));
    expect(screen.getByLabelText("Mixes")).toHaveTextContent("Rain and trees");
    act(() => vi.advanceTimersByTime(1));
    expect(adapter.write).toHaveBeenLastCalledWith({
      favoriteAtmosphereIds: [],
      layerVolumes: {},
      savedMixes: [
        {
          id: "mix-1",
          name: "Rain and trees",
          sceneAtmosphereId: "rainy-apartment",
          layers: [
            {
              sound: {
                atmosphereId: "rainy-apartment",
                layerId: "rain",
              },
              volume: 0.6,
            },
            {
              sound: {
                atmosphereId: "deep-forest",
                layerId: "forest-air",
              },
              volume: 0.3,
            },
          ],
        },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "Update mix" }));
    expect(screen.getByLabelText("Mixes")).toHaveTextContent("Updated mix");
    act(() => vi.advanceTimersByTime(1));

    fireEvent.click(screen.getByRole("button", { name: "Delete mix" }));
    expect(screen.getByLabelText("Mixes")).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));

    expect(adapter.write).toHaveBeenCalledTimes(3);
    expect(adapter.write).toHaveBeenLastCalledWith({
      favoriteAtmosphereIds: [],
      layerVolumes: {},
      savedMixes: [],
    });
  });

  it("refuses mixes beyond the collection limit", () => {
    vi.useFakeTimers();
    let nextId = 0;
    const adapter = createAdapter();
    render(
      <PreferencesProvider
        catalogue={catalogue}
        createMixId={() => `mix-${nextId++}`}
        storageAdapter={adapter}
      >
        <MixLimitProbe />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fill mixes" }));
    expect(screen.getByLabelText("Mix count")).toHaveTextContent("20");
    act(() => vi.runAllTimers());
    expect(adapter.write).toHaveBeenCalledTimes(1);
    expect(vi.mocked(adapter.write).mock.calls[0]?.[0].savedMixes).toHaveLength(
      20,
    );
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
      savedMixes: [],
    });
  });

  it("reports unavailable persistence while preserving memory state", () => {
    vi.useFakeTimers();
    const adapter = createAdapter({
      read: vi.fn().mockReturnValue({
        preferences: {
          favoriteAtmosphereIds: [],
          layerVolumes: {},
          savedMixes: [],
        },
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
