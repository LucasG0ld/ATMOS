import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "../preferences/preferences-provider";
import type { PreferencesStorageAdapter } from "../preferences/preferences-storage";
import type { AudioEngineController } from "../audio/audio-engine";
import { AudioSessionProvider } from "../audio/audio-session";
import { FocusModeProvider } from "../focus/focus-mode";
import { preferenceCatalogue } from "../../data/sounds";
import type { SavedMix } from "../../types/mix";

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

function createMixAdapter(
  savedMixes: readonly SavedMix[] = [],
): PreferencesStorageAdapter {
  return {
    read: vi.fn().mockReturnValue({
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes,
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

function enableDialogNamed(name: string) {
  const dialog = screen
    .getByRole("heading", { hidden: true, name })
    .closest("dialog") as HTMLDialogElement;
  enableDialog(dialog);
  return dialog;
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
    expect(screen.getByRole("slider", { name: "Forest Air" })).toHaveValue(
      "41",
    );
    expect(document.querySelectorAll("[data-layer-origin]")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Play Untitled mix" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save mix" })).toBeEnabled();
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
    expect(document.querySelectorAll("[data-layer-origin]")).toHaveLength(4);
    expect(
      document.querySelectorAll('[data-layer-origin=""]')[0],
    ).toHaveTextContent("Deep Forest");
    expect(
      document.querySelectorAll('[data-layer-origin=""]')[3],
    ).toHaveTextContent("Rainy Apartment");
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

  it("keeps one layer, hides redundant origins and marks changes as unsaved", async () => {
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
    expect(document.querySelectorAll("[data-layer-origin]")).toHaveLength(0);
    fireEvent.change(screen.getByRole("slider", { name: "Rain" }), {
      target: { value: "37" },
    });
    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("warns before a full page exit only while the draft is unsaved", async () => {
    const user = userEvent.setup();
    const view = renderComposer();
    await user.click(
      await screen.findByRole("button", { name: "Remove Window Rain" }),
    );
    const pendingExit = new Event("beforeunload", { cancelable: true });
    expect(window.dispatchEvent(pendingExit)).toBe(false);
    expect(pendingExit.defaultPrevented).toBe(true);

    view.unmount();
    const cleanExit = new Event("beforeunload", { cancelable: true });
    expect(window.dispatchEvent(cleanExit)).toBe(true);
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

  it("creates, updates, renames and deletes a mix with one stable ID", async () => {
    const user = userEvent.setup();
    const adapter = createMixAdapter();
    window.history.replaceState({}, "", "/compose?scene=deep-forest");
    renderComposer(
      <PreferencesProvider
        catalogue={preferenceCatalogue}
        createMixId={() => "stable-mix-id"}
        storageAdapter={adapter}
        writeDelayMs={0}
      >
        <Composer />
      </PreferencesProvider>,
    );

    await screen.findByText("Custom atmosphere · Deep Forest");
    enableDialogNamed("Name your mix");
    enableDialogNamed("Your mixes");
    enableDialogNamed("Discard unsaved changes?");

    const save = screen.getByRole("button", { name: "Save mix" });
    await user.click(save);
    const nameInput = screen.getByRole("textbox", { name: "Mix name" });
    expect(nameInput).toHaveFocus();
    await user.type(nameInput, "Forest rain");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { name: "Forest rain" })).toBeVisible();
    expect(screen.getByText("Mix saved on this device.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Your mixes" })).toBeVisible();
    await waitFor(() => expect(adapter.write).toHaveBeenCalled());
    expect(
      vi.mocked(adapter.write).mock.calls.at(-1)?.[0].savedMixes[0]?.id,
    ).toBe("stable-mix-id");

    fireEvent.change(screen.getByRole("slider", { name: "Forest Air" }), {
      target: { value: "29" },
    });
    expect(screen.getByText("Unsaved changes")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Saved on this device")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Your mixes" }));
    await user.click(
      screen.getByRole("button", { name: "Rename Forest rain" }),
    );
    await user.clear(nameInput);
    await user.type(nameInput, "Same quiet name");
    await user.click(screen.getByRole("button", { name: "Save name" }));
    expect(
      screen.getByRole("heading", { name: "Same quiet name" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Delete Same quiet name" }),
    );
    expect(
      screen.getByRole("heading", { name: "Delete “Same quiet name”?" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Delete mix" }));
    expect(screen.getByRole("heading", { name: "Untitled mix" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Your mixes" }),
    ).not.toBeInTheDocument();
  });

  it("opens a persisted mix in pause and confirms before discarding changes", async () => {
    const user = userEvent.setup();
    const savedMixes: SavedMix[] = [
      {
        id: "mix-one",
        name: "Shared name",
        sceneAtmosphereId: "rainy-apartment",
        layers: [
          {
            sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
            volume: 0.33,
          },
        ],
      },
      {
        id: "mix-two",
        name: "Shared name",
        sceneAtmosphereId: "deep-forest",
        layers: [
          {
            sound: { atmosphereId: "deep-forest", layerId: "forest-air" },
            volume: 0.44,
          },
        ],
      },
    ];
    renderComposer(
      <PreferencesProvider
        catalogue={preferenceCatalogue}
        storageAdapter={createMixAdapter(savedMixes)}
      >
        <Composer />
      </PreferencesProvider>,
    );
    enableDialogNamed("Your mixes");
    enableDialogNamed("Discard unsaved changes?");

    await user.click(await screen.findByRole("button", { name: "Your mixes" }));
    const openButtons = screen.getAllByRole("button", {
      name: "Open Shared name",
    });
    await user.click(openButtons[0]!);
    expect(screen.getByRole("slider", { name: "Rain" })).toHaveValue("33");
    expect(
      screen.getByRole("button", { name: "Play Shared name" }),
    ).toBeVisible();

    fireEvent.change(screen.getByRole("slider", { name: "Rain" }), {
      target: { value: "21" },
    });
    await user.click(screen.getByRole("button", { name: "Your mixes" }));
    await user.click(
      screen.getAllByRole("button", { name: "Open Shared name" })[1]!,
    );
    expect(
      screen.getByRole("heading", { name: "Discard unsaved changes?" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(screen.getByRole("slider", { name: "Forest Air" })).toHaveValue(
      "44",
    );
    expect(
      screen.getByRole("button", { name: "Play Shared name" }),
    ).toBeVisible();
  });

  it("validates names and explains the twenty-mix limit before saving", async () => {
    const user = userEvent.setup();
    const fullCollection: SavedMix[] = Array.from(
      { length: 20 },
      (_, index) => ({
        id: `mix-${index}`,
        name: `Mix ${index}`,
        sceneAtmosphereId: "rainy-apartment",
        layers: [
          {
            sound: { atmosphereId: "rainy-apartment", layerId: "rain" },
            volume: 0.5,
          },
        ],
      }),
    );
    const fullView = renderComposer(
      <PreferencesProvider
        catalogue={preferenceCatalogue}
        storageAdapter={createMixAdapter(fullCollection)}
      >
        <Composer />
      </PreferencesProvider>,
    );
    await screen.findByRole("button", { name: "Your mixes" });
    expect(screen.getByRole("button", { name: "Save mix" })).toBeDisabled();
    expect(screen.getByText(/already has 20 mixes/i)).toBeVisible();
    fullView.unmount();

    const emptyAdapter = createMixAdapter();
    const view = renderComposer(
      <PreferencesProvider
        catalogue={preferenceCatalogue}
        storageAdapter={emptyAdapter}
      >
        <Composer />
      </PreferencesProvider>,
    );
    enableDialogNamed("Name your mix");
    await user.click(screen.getByRole("button", { name: "Save mix" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name");
    fireEvent.change(screen.getByRole("textbox", { name: "Mix name" }), {
      target: { value: "x".repeat(41) },
    });
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "40 characters or fewer",
    );
    view.unmount();
  });

  it("keeps a saved mix in memory when device persistence is unavailable", async () => {
    const user = userEvent.setup();
    const adapter = createMixAdapter();
    vi.mocked(adapter.read).mockReturnValue({
      preferences: {
        favoriteAtmosphereIds: [],
        layerVolumes: {},
        savedMixes: [],
      },
      storageAvailable: false,
    });
    renderComposer(
      <PreferencesProvider
        catalogue={preferenceCatalogue}
        createMixId={() => "memory-mix"}
        storageAdapter={adapter}
      >
        <Composer />
      </PreferencesProvider>,
    );
    enableDialogNamed("Name your mix");
    await user.click(await screen.findByRole("button", { name: "Save mix" }));
    await user.type(
      screen.getByRole("textbox", { name: "Mix name" }),
      "Memory mix",
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("heading", { name: "Memory mix" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "device storage is unavailable",
    );
    expect(screen.getByRole("button", { name: "Your mixes" })).toBeVisible();
  });
});
