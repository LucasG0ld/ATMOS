import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VisualControls } from "../../components/controls/visual-controls";
import { deepForest } from "../../data/atmospheres/deep-forest";
import { fireplace } from "../../data/atmospheres/fireplace";
import { rainyApartment } from "../../data/atmospheres/rainy-apartment";
import type { Atmosphere } from "../../types/atmosphere";

import type { AudioEngineController, AudioLoadResult } from "./audio-engine";
import { AudioSessionProvider, useAudioSession } from "./audio-session";

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

function Player({ atmosphere }: { atmosphere: Atmosphere }) {
  return (
    <VisualControls
      atmosphere={atmosphere}
      atmosphereName={atmosphere.name}
      key={atmosphere.id}
      sounds={atmosphere.sounds}
    />
  );
}

function Session({
  atmosphere,
  createEngine,
}: {
  atmosphere: Atmosphere;
  createEngine: () => AudioEngineController;
}) {
  return (
    <AudioSessionProvider createEngine={createEngine}>
      <Player atmosphere={atmosphere} />
    </AudioSessionProvider>
  );
}

function PreloadProbe() {
  const session = useAudioSession();
  return (
    <>
      <button onClick={() => session?.preloadAtmosphere(deepForest)}>
        Preload forest
      </button>
      <button onClick={() => session?.preloadAtmosphere(fireplace)}>
        Preload fireplace
      </button>
    </>
  );
}

function prepareTimerDialog() {
  const dialog = screen.getByRole("dialog", { hidden: true });
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
  return dialog;
}

function setTimer(duration: number) {
  fireEvent.click(screen.getByRole("button", { name: "Timer" }));
  fireEvent.click(screen.getByRole("button", { name: `${duration} minutes` }));
}

describe("AudioSessionProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("defers audio preloading until Play and respects Save-Data", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    const createEngine = () => engine;
    render(
      <AudioSessionProvider createEngine={createEngine}>
        <Player atmosphere={rainyApartment} />
        <PreloadProbe />
      </AudioSessionProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Preload forest" }));
    expect(engine.preload).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await screen.findByRole("button", { name: /Pause Rainy/ });
    await user.click(screen.getByRole("button", { name: "Preload forest" }));
    expect(engine.preload).toHaveBeenCalledWith(deepForest.sounds);

    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: true },
    });
    await user.click(screen.getByRole("button", { name: "Preload fireplace" }));
    expect(engine.preload).toHaveBeenCalledTimes(1);
    Reflect.deleteProperty(navigator, "connection");
  });

  it("keeps one engine alive and crossfades when the route atmosphere changes", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    const createEngine = vi.fn(() => engine);
    const view = render(
      <Session atmosphere={rainyApartment} createEngine={createEngine} />,
    );

    await user.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await screen.findByRole("button", { name: /Pause Rainy/ });
    view.rerender(
      <Session atmosphere={deepForest} createEngine={createEngine} />,
    );

    await screen.findByRole("button", { name: /Pause Deep Forest/ });
    expect(createEngine).toHaveBeenCalledTimes(1);
    expect(engine.transition).toHaveBeenCalledWith(deepForest.sounds);
    expect(
      document.querySelector('[data-transition-from="rainy-apartment"]'),
    ).toBeTruthy();
    view.unmount();
    expect(engine.destroy).toHaveBeenCalledTimes(1);
  });

  it("synchronizes changed layers in place for a live custom mix", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    const view = render(
      <Session atmosphere={rainyApartment} createEngine={() => engine} />,
    );
    await user.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await screen.findByRole("button", { name: /Pause Rainy/ });

    const expandedMix: Atmosphere = {
      ...rainyApartment,
      sounds: [...rainyApartment.sounds, fireplace.sounds[0]],
    };
    view.rerender(
      <Session atmosphere={expandedMix} createEngine={() => engine} />,
    );

    await waitFor(() =>
      expect(engine.syncLayers).toHaveBeenCalledWith(expandedMix.sounds),
    );
    expect(engine.transition).not.toHaveBeenCalled();
    await screen.findByRole("button", { name: /Pause Rainy/ });
  });

  it("keeps Pause available while a slow target is loading", async () => {
    const user = userEvent.setup();
    let resolveTransition!: (result: AudioLoadResult) => void;
    const engine = createMockEngine();
    vi.mocked(engine.transition).mockReturnValue(
      new Promise((resolve) => {
        resolveTransition = resolve;
      }),
    );
    const createEngine = () => engine;
    const view = render(
      <Session atmosphere={rainyApartment} createEngine={createEngine} />,
    );
    await user.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await screen.findByRole("button", { name: /Pause Rainy/ });

    view.rerender(
      <Session atmosphere={deepForest} createEngine={createEngine} />,
    );
    expect(
      await screen.findByRole("button", { name: /Pause Deep Forest/ }),
    ).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Changing to Deep Forest",
    );

    resolveTransition({ unavailableLayerIds: [] });
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
  });

  it("announces a failed target and allows a successful retry", async () => {
    const user = userEvent.setup();
    const engine = createMockEngine();
    vi.mocked(engine.transition)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ unavailableLayerIds: ["moving-leaves"] });
    const createEngine = () => engine;
    const view = render(
      <Session atmosphere={rainyApartment} createEngine={createEngine} />,
    );
    await user.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await screen.findByRole("button", { name: /Pause Rainy/ });

    view.rerender(
      <Session atmosphere={deepForest} createEngine={createEngine} />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Audio could not be loaded for this atmosphere",
    );
    expect(engine.pause).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Retry Deep Forest/ }));
    await screen.findByRole("button", { name: /Pause Deep Forest/ });
    expect(
      screen.getByRole("slider", { name: "Moving Leaves" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Playback continues");

    await user.click(screen.getByRole("button", { name: /Pause Deep Forest/ }));
    await user.click(screen.getByRole("button", { name: /Play Deep Forest/ }));
    await screen.findByRole("button", { name: /Pause Deep Forest/ });
    expect(
      screen.getByRole("slider", { name: "Moving Leaves" }),
    ).toBeDisabled();
  });

  it("starts, replaces and cancels one wall-clock timer without audio", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-11T12:00:00Z"));
    const createEngine = vi.fn(createMockEngine);
    render(
      <AudioSessionProvider createEngine={createEngine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    prepareTimerDialog();

    setTimer(15);
    expect(screen.getByRole("button", { name: /Timer · 15:00/ })).toBeVisible();
    expect(screen.getByText("Timer set for 15 minutes.")).toHaveAttribute(
      "aria-live",
      "polite",
    );

    fireEvent.click(screen.getByRole("button", { name: /Timer ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "30 minutes" }));
    expect(
      screen.getByText("Timer replaced with 30 minutes."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Timer · 30:00/ })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Timer ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel timer" }));
    expect(screen.getByRole("button", { name: "Timer" })).toBeVisible();
    expect(screen.getByText("Timer canceled.")).toBeInTheDocument();
    expect(createEngine).not.toHaveBeenCalled();
  });

  it("fades an active session for five seconds before confirming Pause", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-11T12:00:00Z"));
    const engine = createMockEngine();
    render(
      <AudioSessionProvider createEngine={() => engine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    prepareTimerDialog();

    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    setTimer(15);
    expect(engine.scheduleTimerFade).toHaveBeenCalledWith(900, 5);
    await act(() => vi.advanceTimersByTime(15 * 60_000));

    expect(engine.fadeOutForTimer).toHaveBeenCalledWith(5);
    expect(
      screen.getByRole("button", { name: "Ending session…" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Play Rainy/ })).toBeVisible();

    await act(() => vi.advanceTimersByTime(4_999));
    expect(screen.queryByText("Timer finished.")).not.toBeInTheDocument();
    await act(() => vi.advanceTimersByTime(1));
    expect(screen.getAllByText("Timer finished.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Timer" })).toBeVisible();
  });

  it("lets an explicit Play cancel the final fade", async () => {
    vi.useFakeTimers();
    const engine = createMockEngine();
    render(
      <AudioSessionProvider createEngine={() => engine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    prepareTimerDialog();
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    setTimer(15);
    await act(() => vi.advanceTimersByTime(15 * 60_000));

    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    expect(engine.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Timer" })).toBeVisible();

    await act(() => vi.advanceTimersByTime(5_000));
    expect(screen.queryByText("Timer finished.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pause Rainy/ })).toBeVisible();
  });

  it("replaces, cancels and rearms engine automation around playback", async () => {
    vi.useFakeTimers();
    const engine = createMockEngine();
    render(
      <AudioSessionProvider createEngine={() => engine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    prepareTimerDialog();
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);

    setTimer(15);
    fireEvent.click(screen.getByRole("button", { name: /Timer ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "30 minutes" }));
    expect(engine.scheduleTimerFade).toHaveBeenNthCalledWith(1, 900, 5);
    expect(engine.scheduleTimerFade).toHaveBeenNthCalledWith(2, 1_800, 5);

    fireEvent.click(screen.getByRole("button", { name: /Pause Rainy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    expect(engine.scheduleTimerFade).toHaveBeenLastCalledWith(1_800, 5);

    fireEvent.click(screen.getByRole("button", { name: /Timer ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel timer" }));
    expect(engine.cancelTimerFade).toHaveBeenCalledTimes(1);
  });

  it("falls back to Pause when a device refuses background resume", async () => {
    const engine = createMockEngine();
    render(
      <AudioSessionProvider createEngine={() => engine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);

    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    fireEvent(document, new Event("visibilitychange"));
    vi.mocked(engine.setPageHidden).mockRejectedValueOnce(
      new Error("resume denied"),
    );
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    fireEvent(document, new Event("visibilitychange"));
    await act(async () => undefined);

    expect(screen.getByRole("button", { name: /Play Rainy/ })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Background playback was paused by your device",
    );
  });

  it("keeps the deadline through Pause and atmosphere changes", async () => {
    vi.useFakeTimers();
    const engine = createMockEngine();
    vi.mocked(engine.fadeOutForTimer).mockReturnValue(0);
    const view = render(
      <Session atmosphere={rainyApartment} createEngine={() => engine} />,
    );
    prepareTimerDialog();
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    setTimer(15);
    fireEvent.click(screen.getByRole("button", { name: /Pause Rainy/ }));

    view.rerender(
      <Session atmosphere={deepForest} createEngine={() => engine} />,
    );
    expect(screen.getByRole("button", { name: /Timer · 15:00/ })).toBeVisible();
    expect(engine.transition).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(15 * 60_000));
    expect(screen.getAllByText("Timer finished.").length).toBeGreaterThan(0);
    expect(engine.fadeOutForTimer).toHaveBeenCalledWith(5);
  });

  it("checks an overdue timer before restoring a visible page", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-11T12:00:00Z"));
    const engine = createMockEngine();
    vi.mocked(engine.fadeOutForTimer).mockReturnValue(0);
    render(
      <AudioSessionProvider createEngine={() => engine}>
        <Player atmosphere={rainyApartment} />
      </AudioSessionProvider>,
    );
    prepareTimerDialog();
    fireEvent.click(screen.getByRole("button", { name: /Play Rainy/ }));
    await act(async () => undefined);
    setTimer(15);

    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    fireEvent(document, new Event("visibilitychange"));
    vi.setSystemTime(new Date("2026-08-11T12:16:00Z"));
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    fireEvent(document, new Event("visibilitychange"));

    expect(
      vi.mocked(engine.fadeOutForTimer).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(engine.setPageHidden).mock.invocationCallOrder.at(-1) ?? 0,
    );
    expect(screen.getAllByText("Timer finished.").length).toBeGreaterThan(0);
  });
});
