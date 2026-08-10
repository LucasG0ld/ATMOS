import type { Atmosphere } from "../../types/atmosphere";

import { rainyApartment } from "./rainy-apartment";

export const atmospheres = [
  rainyApartment,
] as const satisfies readonly Atmosphere[];

export function getAtmosphereBySlug(slug: string): Atmosphere | undefined {
  return atmospheres.find((atmosphere) => atmosphere.slug === slug);
}

export { rainyApartment };
