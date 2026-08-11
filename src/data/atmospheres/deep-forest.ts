import { defineAtmosphere } from "./define-atmosphere";
import { withBasePath } from "../../config/site";

export const deepForest = defineAtmosphere({
  id: "deep-forest",
  slug: "deep-forest",
  name: "Deep Forest",
  displayName: ["Deep", "Forest"],
  description:
    "Cool air, moving leaves, and a path that seems to continue beyond the trees.",
  theme: {
    background: "#0d1711",
    foreground: "#eef2e8",
    muted: "#abb9a8",
    accent: "#9eaa78",
    surface: "rgb(11 24 16 / 48%)",
    overlay: "rgb(5 15 10 / 44%)",
    focus: "#dce8b7",
  },
  visuals: {
    backgroundSrc: withBasePath("/images/atmospheres/deep-forest-desktop.webp"),
    mobileBackgroundSrc: withBasePath(
      "/images/atmospheres/deep-forest-mobile.webp",
    ),
    backgroundAlt: "",
    focalPoint: { x: 52, y: 42 },
    mobileFocalPoint: { x: 50, y: 50 },
    fallbackBackground:
      "radial-gradient(circle at 48% 18%, rgb(176 194 141 / 20%) 0, transparent 22rem), radial-gradient(circle at 72% 66%, rgb(39 78 52 / 34%) 0, transparent 32rem), linear-gradient(128deg, #09110c 0%, #193022 54%, #0b1710 100%)",
  },
  sounds: [
    {
      id: "forest-air",
      name: "Forest Air",
      src: withBasePath("/audio/forest-air.mp3"),
      defaultVolume: 0.58,
    },
    {
      id: "moving-leaves",
      name: "Moving Leaves",
      src: withBasePath("/audio/moving-leaves.mp3"),
      defaultVolume: 0.3,
    },
    {
      id: "distant-stream",
      name: "Distant Stream",
      src: withBasePath("/audio/distant-stream.mp3"),
      defaultVolume: 0.18,
    },
  ],
});
