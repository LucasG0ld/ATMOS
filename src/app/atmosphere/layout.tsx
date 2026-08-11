import type { ReactNode } from "react";

import { AudioSessionProvider } from "@/features/audio/audio-session";

export default function AtmosphereLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AudioSessionProvider>{children}</AudioSessionProvider>;
}
