import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("presents the ordered catalog as real, understandable destinations", () => {
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
    const destinationLinks = screen.getAllByRole("link").slice(1);
    expect(destinationLinks).toHaveLength(4);
    expect(destinationLinks.map((link) => link.textContent)).toEqual([
      expect.stringContaining("Rainy Apartment"),
      expect.stringContaining("Quiet Coffee Shop"),
      expect.stringContaining("Deep Forest"),
      expect.stringContaining("Fireplace"),
    ]);
    expect(destinationLinks[0]).toHaveAttribute(
      "href",
      "/atmosphere/rainy-apartment",
    );
    expect(destinationLinks[3]).toHaveAttribute(
      "href",
      "/atmosphere/fireplace",
    );

    vi.useRealTimers();
  });
});
