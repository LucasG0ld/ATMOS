import { defineAtmosphere } from "./define-atmosphere";
import { withBasePath } from "../../config/site";

export const quietCoffeeShop = defineAtmosphere({
  id: "quiet-coffee-shop",
  slug: "quiet-coffee-shop",
  name: "Quiet Coffee Shop",
  displayName: ["Quiet", "Coffee Shop"],
  description:
    "A slow morning held together by warm light and the quiet rhythm of the café.",
  theme: {
    background: "#1b1510",
    foreground: "#f5ead8",
    muted: "#c8b59a",
    accent: "#c78b55",
    surface: "rgb(36 26 18 / 46%)",
    overlay: "rgb(28 18 11 / 38%)",
    focus: "#ffe0ad",
  },
  visuals: {
    backgroundSrc: withBasePath(
      "/images/atmospheres/quiet-coffee-shop-desktop.webp",
    ),
    mobileBackgroundSrc: withBasePath(
      "/images/atmospheres/quiet-coffee-shop-mobile.webp",
    ),
    backgroundAlt: "",
    focalPoint: { x: 62, y: 38 },
    mobileFocalPoint: { x: 50, y: 48 },
    fallbackBackground:
      "radial-gradient(circle at 72% 22%, rgb(255 219 166 / 28%) 0, transparent 24rem), radial-gradient(circle at 28% 68%, rgb(120 73 42 / 32%) 0, transparent 30rem), linear-gradient(120deg, #17110d 0%, #3a291d 55%, #1b130e 100%)",
  },
  sounds: [],
});
