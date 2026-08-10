"use client";

import { useEffect, useState } from "react";

import { getTimeGreeting } from "../../features/clock/get-time-greeting";

const FALLBACK_GREETING = "Hello.";

export function TimeGreeting() {
  const [greeting, setGreeting] = useState<string>(FALLBACK_GREETING);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeGreeting(new Date()));
    updateGreeting();

    const interval = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return <p>{greeting}</p>;
}
