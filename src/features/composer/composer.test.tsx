import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "../preferences/preferences-provider";
import type { PreferencesStorageAdapter } from "../preferences/preferences-storage";
import type { AudioEngineController } from "../audio/audio-engine";
import { AudioSessionProvider } from "../audio/audio-session";
import { FocusModeProvider } from "../focus/focus-mode";

import { Composer } from "./composer";

function createAdapter(): PreferencesStorageAdapter {
  return {
    read: vi.fn().mockReturnValue({
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: { "deep-forest": { "forest-air": 0.41 } },
        savedMixes: [],
      },
      storageAvailable: true,
    }),
    reset: vi.fn().mockReturnValue(true),
    write: vi.fn().mockReturnValue(true),
  };
}

function createMockEngine(): AudioEngineController {
  return {
    addLayer: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    cancelPreload: vi.fn(),
    cancelTimerFade: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
    fadeOutForTimer: vi.fn().mockReturnValue(0),
    load: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    preload: vi.fn().mockResolvedValue(undefined),
    scheduleTimerFade: vi.fn().mockReturnValue(true),
    setLayerVolume: vi.fn(),
    setPageHidden: vi.fn().mockResolvedValue(undefined),
    syncLayers: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    transition: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
  };
}

function renderComposer(children = <Composer />) {
  const engine = createMockEngine();
  const view = render(
    <FocusModeProvider>
      <AudioSessionProvider createEngine={() => engine}>
        {children}
      </AudioSessionProvider>
    </FocusModeProvider>,
  );
  return { engine, ...view };
}

function enableDialog(dialog: HTMLDialogElement) {
  Object.defineProperty(dialog, "showModal", {
    configurable: true,
    value: vi.fn(() => dialog.setAttribute("open", "")),
  });
  Object.defineProperty(dialog, "close", {
    configurable: true,
    value: vi.fn(() => {
      dialog.removeAttribute("open");
      fireEvent(dialog, new Event("close"));
    }),
  });
}

describe("Composer", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("hydrates the requested scene and its stored volumes without audio", async () => {
    const fetchSpy = vi.fn();
    const audioContextSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("AudioContext", audioContextSpy);
    window.history.replaceState({}, "", "/compose?scene=deep-forest");

    renderComposer(
      <PreferencesProvider
        catalogue={[
          {
            atmosphereId: "deep-forest",
            soundLayerIds: ["forest-air", "moving-leaves", "distant-stream"],
          },
        ]}
        storageAdapter={createAdapter()}
      >
        <Composer />
      </PreferencesProvider>,
    );

    await waitFor(() =>
      expect(
        document.querySelector('[data-atmosphere="deep-forest"]'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Untitled mix" })).toBeVisible();
    expect(screen.getByText("Custom atmosphere · Deep Forest")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Back to Deep Forest" }),
    ).toHaveAttribute("href", "/atmosphere/deep-forest");
    expect(screen.getAllByRole("slider")).toHaveLength(3);
    expect(
      screen.getByRole("slider", { name: "Forest Air from Deep Forest" }),
    ).toHaveValue("41");
    expect(
      screen.getByRole("button", { name: "Play Untitled mix" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save mix" })).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(audioContextSpy).not.toHaveBeenCalled();
  });

  it("adds one catalog sound, explains the limit and restores dialog focus", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    const audioContextSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("AudioContext", audioContextSpy);
    window.history.replaceState({}, "", "/compose?scene=deep-forest");
    renderComposer();

    await screen.findByText("Custom atmosphere · Deep Forest");
    const trigger = screen.getByRole("button", { name: "Add sound" });
    const dialog = screen
      .getByRole("heading", { hidden: true, name: "Add a sound" })
      .closest("dialog") as HTMLDialogElement;
    enableDialog(dialog);

    await user.click(trigger);
    expect(dialog).toHaveAttribute("open");
    await user.click(
      screen.getByRole("button", {
        name: "Add Rain from Rainy Apartment",
      }),
    );

    expect(screen.getAllByRole("slider")).toHaveLength(4);
    expect(
      screen.getByRole("slider", { name: "Rain from Rainy Apartment" }),
    ).toHaveValue("65");
    expect(screen.getByText("Rain added to the mix.")).toBeVisible();
    expect(trigger).toHaveFocus();

    const fullTrigger = screen.getByRole("button", {
      name: "Mix full · 4 sounds",
    });
    await user.click(fullTrigger);
    expect(screen.getByText(/already has four sounds/i)).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Add Window Rain from Rainy Apartment",
      }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Close sound library" }),
    );
    expect(fullTrigger).toHaveFocus();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(audioContextSpy).not.toHaveBeenCalled();
  });

  it("keeps one layer, exposes origins and marks changes as unsaved", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/compose?scene=rainy-apartment");
    renderComposer();

    await user.click(
      await screen.findByRole("button", { name: "Remove Window Rain" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove Distant Thunder" }),
    );

    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(screen.getByText("A mix needs at least one sound.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove Rain" })).toBeDisabled();
    fireEvent.change(
      screen.getByRole("slider", { name: "Rain from Rainy Apartment" }),
      { target: { value: "37" } },
    );
    expect(screen.getByText("Unsaved draft")).toBeVisible();
  });

  it("falls back safely when the requested scene is unknown", async () => {
    window.history.replaceState({}, "", "/compose?scene=unknown");
    renderComposer();

    await screen.findByText("Custom atmosphere · Rainy Apartment");
    expect(screen.getAllByRole("slider")).toHaveLength(3);
  });

  it("plays once, then synchronizes additions, removals and live volume", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/compose?scene=deep-forest");
    const { engine } = renderComposer();

    await user.click(
      await screen.findByRole("button", { name: "Play Untitled mix" }),
    );
    await screen.findByRole("button", { name: "Pause Untitled mix" });
    expect(engine.load).toHaveBeenCalledTimes(1);
    expect(engine.play).toHaveBeenCalledTimes(1);

    const dialog = screen
      .getByRole("heading", { hidden: true, name: "Add a sound" })
      .closest("dialog") as HTMLDialogElement;
    enableDialog(dialog);
    await user.click(screen.getByRole("button", { name: "Add sound" }));
    await user.click(
      screen.getByRole("button", {
        name: "Add Rain from Rainy Apartment",
      }),
    );
    await waitFor(() => expect(engine.syncLayers).toHaveBeenCalled());

    fireEvent.change(
      screen.getByRole("slider", { name: "Rain from Rainy Apartment" }),
      { target: { value: "34" } },
    );
    expect(engine.setLayerVolume).toHaveBeenCalledWith(
      "rainy-apartment:rain",
      0.34,
    );

    await user.click(screen.getByRole("button", { name: "Remove Rain" }));
    await waitFor(() => expect(engine.syncLayers).toHaveBeenCalledTimes(2));
    expect(engine.pause).not.toHaveBeenCalled();
  });

  it("keeps playback and the timer reachable in Focus Mode", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.click(await screen.findByRole("button", { name: "Focus" }));
    expect(screen.getByRole("button", { name: "Exit focus" })).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Play Untitled mix" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Timer" })).toBeVisible();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save mix" }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: "Focus" })).toHaveFocus();
  });
});
