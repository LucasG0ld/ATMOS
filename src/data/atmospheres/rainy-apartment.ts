import { defineAtmosphere } from "./define-atmosphere";

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
    backgroundAlt: "",
    focalPoint: { x: 68, y: 42 },
    fallbackBackground:
      "radial-gradient(circle at 78% 24%, rgb(201 157 104 / 24%) 0, transparent 23rem), radial-gradient(circle at 66% 56%, rgb(50 73 91 / 38%) 0, transparent 32rem), linear-gradient(118deg, #090f16 0%, #111d28 58%, #0a121a 100%)",
  },
  sounds: [
    {
      id: "rain",
      name: "Rain",
      src: "/audio/rain.mp3",
      defaultVolume: 0.65,
    },
    {
      id: "window-rain",
      name: "Window Rain",
      src: "/audio/window-rain.mp3",
      defaultVolume: 0.4,
    },
    {
      id: "distant-thunder",
      name: "Distant Thunder",
      src: "/audio/distant-thunder.mp3",
      defaultVolume: 0.15,
    },
  ],
});
