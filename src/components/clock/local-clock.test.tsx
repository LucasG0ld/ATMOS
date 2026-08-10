import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocalClock } from "./local-clock";

describe("LocalClock", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("reserves space without exposing an incorrect server time", () => {
    const markup = renderToString(<LocalClock />);

    expect(markup).toContain("visibility:hidden");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain("datetime=");
  });

  it("shows the browser local time after hydration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 22, 7));

    render(<LocalClock />);

    const clock = screen.getByText(/22:07|10:07/);
    expect(clock).toHaveAttribute("data-ready", "true");
    expect(clock).toHaveAttribute("datetime", "22:07");
  });

  it("cleans up its aligned update timer", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<LocalClock />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });
});
