"use client";

import { useEffect, useState } from "react";

import {
  formatLocalTime,
  formatMachineTime,
} from "../../features/clock/format-local-time";

type LocalClockProps = {
  className?: string;
};

export function LocalClock({ className }: LocalClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();

    let intervalId: number | undefined;
    const delayUntilNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = window.setTimeout(() => {
      update();
      intervalId = window.setInterval(update, 60_000);
    }, delayUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const visibleTime = now ? formatLocalTime(now) : "00:00";

  return (
    <time
      aria-hidden={now ? undefined : true}
      aria-label={now ? `Local time, ${visibleTime}` : undefined}
      className={className}
      data-ready={now ? "true" : "false"}
      dateTime={now ? formatMachineTime(now) : undefined}
      style={now ? undefined : { visibility: "hidden" }}
    >
      {visibleTime}
    </time>
  );
}
