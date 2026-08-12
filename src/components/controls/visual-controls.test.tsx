import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { rainyApartment } from "../../data/atmospheres/rainy-apartment";
import type { AudioEngineController } from "../../features/audio/audio-engine";
import { AudioSessionProvider } from "../../features/audio/audio-session";
import {
  FocusModeProvider,
  FocusModeSurface,
} from "../../features/focus/focus-mode";
import {
  PreferencesProvider,
  usePreferences,
} from "../../features/preferences/preferences-provider";
import type { PreferencesStorageAdapter } from "../../features/preferences/preferences-storage";

import { VisualControls } from "./visual-controls";

function createMockEngine(): AudioEngineController {
  return {
    addLayer: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    cancelPreload: vi.fn(),
    cancelTimerFade: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
    fadeOutForTimer: vi.fn().mockReturnValue(5_000),
    load: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    preload: vi.fn().mockResolvedValue(undefined),
    setLayerVolume: vi.fn(),
    setPageHidden: vi.fn().mockResolvedValue(undefined),
    scheduleTimerFade: vi.fn().mockReturnValue(true),
    syncLayers: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    transition: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
  };
}

function renderControls(engine = createMockEngine()) {
  const view = render(
    <VisualControls
      atmosphereName={rainyApartment.name}
      createEngine={() => engine}
      sounds={rainyApartment.sounds}
    />,
  );

  return { engine, ...view };
}

function ResetPreferences() {
  const preferences = usePreferences();
  return (
    <button onClick={preferences.resetPreferences}>
      Reset test preferences
    </button>
  );
}

function renderPersistentControls(
  engine = createMockEngine(),
  adapter: PreferencesStorageAdapter = {
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
  },
) {
  const view = render(
    <PreferencesProvider
      catalogue={[
        {
          atmosphereId: rainyApartment.id,
          soundLayerIds: rainyApartment.sounds.map(({ id }) => id),
        },
      ]}
      storageAdapter={adapter}
    >
      <VisualControls
        atmosphere={rainyApartment}
        atmosphereName={rainyApartment.name}
        createEngine={() => engine}
        sounds={rainyApartment.sounds}
      />
      <ResetPreferences />
    </PreferencesProvider>,
  );

  return { adapter, engine, ...view };
}

describe("VisualControls", () => {
  it("exposes three native sliders with their initial values", () => {
    renderControls();

    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);
    expect(screen.getByRole("slider", { name: "Rain" })).toHaveValue("65");
    expect(screen.getByRole("slider", { name: "Window Rain" })).toHaveValue(
      "40",
    );
    expect(screen.getByRole("slider", { name: "Distant Thunder" })).toHaveValue(
      "15",
    );

    for (const slider of sliders) {
      expect(slider).toHaveAttribute("min", "0");
      expect(slider).toHaveAttribute("max", "100");
      expect(slider).toHaveAttribute("step", "1");
      expect(slider).toHaveAccessibleName();
    }
  });

  it("exposes an accessible pending state when audio is not yet available", () => {
    const createEngine = vi.fn(createMockEngine);

    render(
      <VisualControls
        atmosphereName="Deep Forest"
        createEngine={createEngine}
        sounds={[]}
      />,
    );

    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.getByText("Sound layers are being prepared for this atmosphere."),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Audio unavailable for Deep Forest" }),
    ).toBeDisabled();
    expect(createEngine).not.toHaveBeenCalled();
  });

  it("updates layers independently", () => {
    renderControls();
    const rain = screen.getByRole("slider", { name: "Rain" });
    const thunder = screen.getByRole("slider", { name: "Distant Thunder" });

    fireEvent.change(rain, { target: { value: "72" } });

    expect(rain).toHaveValue("72");
    expect(rain).toHaveAttribute("aria-valuetext", "72%");
    expect(thunder).toHaveValue("15");
  });

  it("restores volumes and applies reset defaults to an active engine", async () => {
    const user = userEvent.setup();
    const adapter: PreferencesStorageAdapter = {
      read: vi.fn().mockReturnValue({
        preferences: {
          favoriteAtmosphereIds: [],
          layerVolumes: { [rainyApartment.id]: { rain: 0.31 } },
          savedMixes: [],
        },
        storageAvailable: true,
      }),
      reset: vi.fn().mockReturnValue(true),
      write: vi.fn().mockReturnValue(true),
    };
    const { engine } = renderPersistentControls(createMockEngine(), adapter);
    const rain = screen.getByRole("slider", { name: "Rain" });

    expect(rain).toHaveValue("31");
    await user.click(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    );
    expect(engine.setLayerVolume).toHaveBeenCalledWith("rain", 0.31);

    fireEvent.change(rain, { target: { value: "72" } });
    expect(rain).toHaveValue("72");
    expect(engine.setLayerVolume).toHaveBeenCalledWith("rain", 0.72);

    await user.click(
      screen.getByRole("button", { name: "Reset test preferences" }),
    );
    expect(rain).toHaveValue("65");
    expect(engine.setLayerVolume).toHaveBeenCalledWith("rain", 0.65);
  });

  it("exposes a pressed-state favorite action", async () => {
    const user = userEvent.setup();
    renderPersistentControls();

    const addFavorite = screen.getByRole("button", {
      name: "Add to favorites",
    });
    expect(addFavorite).toHaveAttribute("aria-pressed", "false");

    await user.click(addFavorite);

    expect(
      screen.getByRole("button", {
        name: "Remove from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps every control in a natural keyboard order", async () => {
    const user = userEvent.setup();
    renderControls();

    await user.tab();
    expect(screen.getByRole("slider", { name: "Rain" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("slider", { name: "Window Rain" })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("slider", { name: "Distant Thunder" }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.queryByRole("button", { name: /favorites/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    ).toHaveFocus();
  });

  it("loads and plays after the explicit user action, then pauses", async () => {
    const user = userEvent.setup();
    const { engine } = renderControls();

    await user.click(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    );

    expect(
      await screen.findByRole("button", { name: "Pause Rainy Apartment" }),
    ).toHaveAttribute("data-playing", "true");
    expect(engine.load).toHaveBeenCalledTimes(1);
    expect(engine.play).toHaveBeenCalledTimes(1);
    expect(engine.setLayerVolume).toHaveBeenCalledWith("rain", 0.65);

    await user.click(
      screen.getByRole("button", { name: "Pause Rainy Apartment" }),
    );

    expect(engine.pause).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    ).toHaveAttribute("data-playing", "false");
  });

  it("keeps the interface retryable after a total loading failure", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    vi.mocked(engine.load)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ unavailableLayerIds: [] });
    renderControls(engine);

    await user.click(screen.getByRole("button", { name: /Play/ }));

    expect(
      await screen.findByRole("button", { name: "Retry Rainy Apartment" }),
    ).toBeEnabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Audio could not be loaded",
    );

    await user.click(screen.getByRole("button", { name: /Retry/ }));

    expect(
      await screen.findByRole("button", { name: "Pause Rainy Apartment" }),
    ).toBeEnabled();
    expect(engine.load).toHaveBeenCalledTimes(2);
  });

  it("reports unsupported Web Audio without leaving a false playing state", async () => {
    const user = userEvent.setup();
    render(
      <VisualControls
        atmosphereName={rainyApartment.name}
        createEngine={() => {
          throw new Error("Web Audio unavailable");
        }}
        sounds={rainyApartment.sounds}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Play/ }));

    expect(
      await screen.findByRole("button", { name: "Retry Rainy Apartment" }),
    ).toHaveAttribute("data-playing", "false");
    expect(screen.getByRole("alert")).toBeVisible();
  });

  it("continues with available layers and disables the failed layer", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    vi.mocked(engine.load).mockResolvedValue({
      unavailableLayerIds: ["window-rain"],
    });
    renderControls(engine);

    await user.click(screen.getByRole("button", { name: /Play/ }));

    expect(
      await screen.findByRole("button", { name: "Pause Rainy Apartment" }),
    ).toBeEnabled();
    expect(screen.getByRole("slider", { name: "Window Rain" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Playback continues");
  });

  it("destroys its engine on unmount", async () => {
    const user = userEvent.setup();
    const { engine, unmount } = renderControls();

    await user.click(screen.getByRole("button", { name: /Play/ }));
    await screen.findByRole("button", { name: /Pause/ });
    unmount();

    expect(engine.destroy).toHaveBeenCalledTimes(1);
  });

  it("does not create a duplicate engine under React Strict Mode", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    const createEngine = vi.fn(() => engine);
    const { unmount } = render(
      <StrictMode>
        <VisualControls
          atmosphereName={rainyApartment.name}
          createEngine={createEngine}
          sounds={rainyApartment.sounds}
        />
      </StrictMode>,
    );

    await user.click(screen.getByRole("button", { name: /Play/ }));
    await screen.findByRole("button", { name: /Pause/ });

    expect(createEngine).toHaveBeenCalledTimes(1);
    unmount();
    expect(engine.destroy).toHaveBeenCalledTimes(1);
  });

  it("keeps playback, timer and recoverable errors available in Focus Mode", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    vi.mocked(engine.load).mockRejectedValue(new Error("offline"));

    render(
      <PreferencesProvider
        catalogue={[
          {
            atmosphereId: rainyApartment.id,
            soundLayerIds: rainyApartment.sounds.map(({ id }) => id),
          },
        ]}
        storageAdapter={{
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
        }}
      >
        <FocusModeProvider>
          <AudioSessionProvider createEngine={() => engine}>
            <FocusModeSurface>
              <VisualControls
                atmosphere={rainyApartment}
                atmosphereName={rainyApartment.name}
                sounds={rainyApartment.sounds}
              />
            </FocusModeSurface>
          </AudioSessionProvider>
        </FocusModeProvider>
      </PreferencesProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Focus" }));

    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /favorites/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Timer" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Exit focus" })).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    );

    expect(
      await screen.findByRole("button", { name: "Retry Rainy Apartment" }),
    ).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Audio could not be loaded",
    );
  });
});
