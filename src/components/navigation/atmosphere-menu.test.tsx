import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { atmospheres } from "../../data/atmospheres";

import { AtmosphereMenu } from "./atmosphere-menu";

describe("AtmosphereMenu", () => {
  it("focuses the current atmosphere and returns focus when closed", async () => {
    const user = userEvent.setup();
    render(
      <AtmosphereMenu atmospheres={atmospheres} currentSlug="deep-forest" />,
    );
    const trigger = screen.getByRole("button", { name: "Atmospheres" });
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

    await user.click(trigger);

    const currentLink = screen.getByRole("link", {
      name: "Deep Forest, current atmosphere",
    });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    expect(currentLink).toHaveFocus();
    expect(screen.getAllByRole("link")).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: "Close atmospheres" }));

    expect(trigger).toHaveFocus();
  });
});
