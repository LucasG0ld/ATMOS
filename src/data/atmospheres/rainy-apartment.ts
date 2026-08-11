import { defineAtmosphere } from "./define-atmosphere";
import { withBasePath } from "../../config/site";

export const rainyApartment = defineAtmosphere({
  id: "rainy-apartment",
  slug: "rainy-apartment",
  name: "Rainy Apartment",
  displayName: ["Rainy", "Apartment"],
  description: "A quiet evening while the city disappears behind the rain.",
  theme: {
    background: "#0d141c",
    foreground: "#f4f0e8",
    muted: "#b9c0c5",
    accent: "#c99d68",
    surface: "rgb(8 14 20 / 42%)",
    overlay: "rgb(4 9 14 / 48%)",
    focus: "#f4d8a8",
  },
  visuals: {
    backgroundSrc: withBasePath(
      "/images/atmospheres/rainy-apartment-desktop.webp",
    ),
    mobileBackgroundSrc: withBasePath(
      "/images/atmospheres/rainy-apartment-mobile.webp",
    ),
    backgroundAlt: "",
    focalPoint: { x: 68, y: 42 },
    mobileFocalPoint: { x: 50, y: 50 },
    texture: "rain",
    fallbackBackground:
      "radial-gradient(circle at 78% 24%, rgb(201 157 104 / 24%) 0, transparent 23rem), radial-gradient(circle at 66% 56%, rgb(50 73 91 / 38%) 0, transparent 32rem), linear-gradient(118deg, #090f16 0%, #111d28 58%, #0a121a 100%)",
  },
  sounds: [
    {
      id: "rain",
      name: "Rain",
      src: withBasePath("/audio/rain.mp3"),
      defaultVolume: 0.65,
    },
    {
      id: "window-rain",
      name: "Window Rain",
      src: withBasePath("/audio/window-rain.mp3"),
      defaultVolume: 0.4,
    },
    {
      id: "distant-thunder",
      name: "Distant Thunder",
      src: withBasePath("/audio/distant-thunder.mp3"),
      defaultVolume: 0.15,
    },
  ],
});
