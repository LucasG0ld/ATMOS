import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Wordmark } from "./wordmark";

describe("Wordmark", () => {
  it("links back to the home page with an accessible name", () => {
    render(<Wordmark />);

    expect(screen.getByRole("link", { name: "ATMOS — Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
