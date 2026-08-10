import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AtmospherePage, { generateMetadata, generateStaticParams } from "./page";

describe("AtmospherePage", () => {
  it("renders the data-driven visual player and navigation", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 22, 7));
    const page = await AtmospherePage({
      params: Promise.resolve({ slug: "rainy-apartment" }),
    });

    render(page);

    expect(
      screen.getByRole("heading", { name: "Rainy Apartment" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/22:07|10:07/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to atmospheres" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("group", { name: "Sound layers" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("slider")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Play Rainy Apartment" }),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("pre-renders every atmosphere in the catalog", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "rainy-apartment" },
      { slug: "quiet-coffee-shop" },
      { slug: "deep-forest" },
      { slug: "fireplace" },
    ]);
  });

  it("renders the final mix for a catalog atmosphere", async () => {
    const page = await AtmospherePage({
      params: Promise.resolve({ slug: "deep-forest" }),
    });

    render(page);

    expect(
      screen.getByRole("heading", { name: "Deep Forest" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Atmosphere · 03")).toBeInTheDocument();
    expect(screen.getAllByRole("slider")).toHaveLength(3);
    expect(screen.getByRole("slider", { name: "Forest Air" })).toHaveValue(
      "58",
    );
    expect(screen.getByRole("slider", { name: "Moving Leaves" })).toHaveValue(
      "30",
    );
    expect(screen.getByRole("slider", { name: "Distant Stream" })).toHaveValue(
      "18",
    );
    expect(
      screen.getByRole("button", { name: "Play Deep Forest" }),
    ).toBeEnabled();
  });

  it("rejects a slug that is not part of the catalog", async () => {
    await expect(
      AtmospherePage({
        params: Promise.resolve({ slug: "unknown-room" }),
      }),
    ).rejects.toThrow();
  });

  it("generates atmosphere metadata from the catalog", async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: "rainy-apartment" }),
      }),
    ).resolves.toMatchObject({
      title: "Rainy Apartment",
    });

    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: "quiet-coffee-shop" }),
      }),
    ).resolves.toMatchObject({
      title: "Quiet Coffee Shop",
      description:
        "A slow morning held together by warm light and the quiet rhythm of the café.",
    });
  });
});
