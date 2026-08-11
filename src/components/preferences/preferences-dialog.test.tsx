import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PreferencesProvider } from "../../features/preferences/preferences-provider";
import type { PreferencesStorageAdapter } from "../../features/preferences/preferences-storage";

import { PreferencesDialog } from "./preferences-dialog";

function renderDialog(storageAvailable = true) {
  const adapter: PreferencesStorageAdapter = {
    read: vi.fn().mockReturnValue({
      preferences: {
        favoriteAtmosphereIds: ["rainy-apartment"],
        layerVolumes: { "rainy-apartment": { rain: 0.42 } },
      },
      storageAvailable,
    }),
    reset: vi.fn().mockReturnValue(storageAvailable),
    write: vi.fn().mockReturnValue(storageAvailable),
  };
  render(
    <PreferencesProvider
      catalogue={[{ atmosphereId: "rainy-apartment", soundLayerIds: ["rain"] }]}
      storageAdapter={adapter}
    >
      <PreferencesDialog />
    </PreferencesProvider>,
  );

  const dialog = screen.getByRole("dialog", { hidden: true });
  Object.defineProperty(dialog, "showModal", {
    value: vi.fn(() => dialog.setAttribute("open", "")),
  });
  Object.defineProperty(dialog, "close", {
    value: vi.fn(() => {
      dialog.removeAttribute("open");
      fireEvent(dialog, new Event("close"));
    }),
  });
  return { adapter, dialog };
}

describe("PreferencesDialog", () => {
  it("explains local persistence, resets it and restores trigger focus", async () => {
    const user = userEvent.setup();
    const { adapter } = renderDialog();
    const trigger = screen.getByRole("button", { name: "Preferences" });

    await user.click(trigger);
    expect(
      screen.getByText("Favorites and volumes are saved on this device."),
    ).toBeVisible();
    expect(screen.getByText("Saved preferences")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Reset saved preferences" }),
    );
    expect(adapter.reset).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Nothing saved yet")).toBeVisible();
    expect(screen.getByText("Saved preferences reset.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close preferences" }));
    expect(trigger).toHaveFocus();
  });

  it("reports unavailable device persistence without blocking actions", async () => {
    const user = userEvent.setup();
    renderDialog(false);
    await user.click(screen.getByRole("button", { name: "Preferences" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Preferences remain available for this visit",
    );
    expect(
      screen.getByRole("button", { name: "Reset saved preferences" }),
    ).toBeEnabled();
  });
});
