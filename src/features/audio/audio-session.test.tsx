import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VisualControls } from "../../components/controls/visual-controls";
import { deepForest } from "../../data/atmospheres/deep-forest";
import { fireplace } from "../../data/atmospheres/fireplace";
import { rainyApartment } from "../../data/atmospheres/rainy-apartment";
import type { Atmosphere } from "../../types/atmosphere";

import type { AudioEngineController, AudioLoadResult } from "./audio-engine";
import { AudioSessionProvider, useAudioSession } from "./audio-session";

function createMockEngine(): AudioEngineController {
  return {
    cancelPreload: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
    load: vi.fn().mockResolvedValue({ unavailableLayerIds: [] }),
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    preload: vi.fn().mockResolvedValue(undefined),
    setLayerVolume: vi.fn(),
    setPageHidden: vi.fn().mockResolvedValue(undefined),
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

describe("AudioSessionProvider", () => {
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
});
