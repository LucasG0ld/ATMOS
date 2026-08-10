import type { Atmosphere } from "../../types/atmosphere";

import { deepForest } from "./deep-forest";
import { fireplace } from "./fireplace";
import { quietCoffeeShop } from "./quiet-coffee-shop";
import { rainyApartment } from "./rainy-apartment";

export const atmospheres = [
  rainyApartment,
  quietCoffeeShop,
  deepForest,
  fireplace,
] as const satisfies readonly Atmosphere[];

export function getAtmosphereBySlug(slug: string): Atmosphere | undefined {
  return atmospheres.find((atmosphere) => atmosphere.slug === slug);
}

export { deepForest, fireplace, quietCoffeeShop, rainyApartment };
