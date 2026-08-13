import type { ReactNode } from "react";

import { AudioSessionProvider } from "@/features/audio/audio-session";
import { FocusModeProvider } from "@/features/focus/focus-mode";

export default function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <FocusModeProvider>
      <AudioSessionProvider>{children}</AudioSessionProvider>
    </FocusModeProvider>
  );
}
