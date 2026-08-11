import { defineAtmosphere } from "./define-atmosphere";
import { withBasePath } from "../../config/site";

export const fireplace = defineAtmosphere({
  id: "fireplace",
  slug: "fireplace",
  name: "Fireplace",
  displayName: ["Fireplace"],
  description:
    "A winter evening shaped by firelight, still rooms, and the weather beyond the window.",
  theme: {
    background: "#17100d",
    foreground: "#f7eee4",
    muted: "#c7aea0",
    accent: "#d58a4b",
    surface: "rgb(28 16 12 / 48%)",
    overlay: "rgb(16 8 6 / 44%)",
    focus: "#ffd19b",
  },
  visuals: {
    backgroundSrc: withBasePath("/images/atmospheres/fireplace-desktop.webp"),
    mobileBackgroundSrc: withBasePath(
      "/images/atmospheres/fireplace-mobile.webp",
    ),
    backgroundAlt: "",
    focalPoint: { x: 58, y: 60 },
    mobileFocalPoint: { x: 50, y: 52 },
    fallbackBackground:
      "radial-gradient(circle at 58% 64%, rgb(222 116 52 / 36%) 0, transparent 22rem), radial-gradient(circle at 70% 38%, rgb(255 190 104 / 18%) 0, transparent 28rem), linear-gradient(122deg, #100b09 0%, #2d1a13 58%, #140d0a 100%)",
  },
  sounds: [
    {
      id: "fire",
      name: "Fire",
      src: withBasePath("/audio/fire.mp3"),
      defaultVolume: 0.64,
    },
    {
      id: "winter-wind",
      name: "Winter Wind",
      src: withBasePath("/audio/winter-wind.mp3"),
      defaultVolume: 0.18,
    },
    {
      id: "quiet-room",
      name: "Quiet Room",
      src: withBasePath("/audio/quiet-room.mp3"),
      defaultVolume: 0.12,
    },
  ],
});
