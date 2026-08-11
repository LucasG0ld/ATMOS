import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  FocusModeProvider,
  FocusModeSecondary,
  FocusModeSurface,
  useOptionalFocusMode,
} from "./focus-mode";

function FocusScene({ atmosphereName }: { atmosphereName: string }) {
  const focusMode = useOptionalFocusMode();
  return (
    <FocusModeSurface>
      <h1>{atmosphereName}</h1>
      <FocusModeSecondary>
        <button type="button">Atmospheres</button>
        <button
          data-focus-trigger=""
          onClick={(event) => focusMode?.enterFocus(event.currentTarget)}
          type="button"
        >
          Focus
        </button>
      </FocusModeSecondary>
      <button data-focus-playback="" type="button">
        Play
      </button>
    </FocusModeSurface>
  );
}

describe("FocusModeProvider", () => {
  it("removes secondary controls and restores focus after a visible exit", async () => {
    const user = userEvent.setup();
    render(
      <FocusModeProvider>
        <FocusScene atmosphereName="Rainy Apartment" />
      </FocusModeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Focus" }));

    expect(
      screen.queryByRole("button", { name: "Atmospheres" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Exit focus" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Exit focus" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Focus" })).toHaveFocus(),
    );
    expect(screen.getByRole("button", { name: "Atmospheres" })).toBeVisible();
  });

  it("exits with Escape and survives an atmosphere change", async () => {
    const user = userEvent.setup();
    const view = render(
      <FocusModeProvider>
        <FocusScene atmosphereName="Rainy Apartment" />
      </FocusModeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Focus" }));

    view.rerender(
      <FocusModeProvider>
        <FocusScene atmosphereName="Deep Forest" />
      </FocusModeProvider>,
    );
    expect(screen.getByRole("heading", { name: "Deep Forest" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Exit focus" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Atmospheres" }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Focus" })).toHaveFocus(),
    );
  });
});
