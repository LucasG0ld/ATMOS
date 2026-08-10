import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("presents Rainy Apartment as a real, understandable destination", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 20, 0));

    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "What atmosphere do you need today?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Good evening.")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Atmospheres" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Rainy Apartment/i }),
    ).toHaveAttribute("href", "/atmosphere/rainy-apartment");

    vi.useRealTimers();
  });
});
