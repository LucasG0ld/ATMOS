import type { Metadata } from "next";

import { Composer } from "@/features/composer/composer";

export const metadata: Metadata = {
  title: "Compose",
  description: "Shape a personal atmosphere from the sounds already in ATMOS.",
};

export default function ComposePage() {
  return <Composer />;
}
