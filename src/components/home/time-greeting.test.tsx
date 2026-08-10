import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TimeGreeting } from "./time-greeting";

describe("TimeGreeting", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the same neutral fallback on the server and first client pass", () => {
    expect(renderToString(<TimeGreeting />)).toContain("Hello.");
  });

  it("uses the browser local time after hydration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 8, 30));

    render(<TimeGreeting />);

    expect(screen.getByText("Good morning.")).toBeInTheDocument();
  });

  it("cleans up its minute timer", () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = render(<TimeGreeting />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledOnce();
  });
});
