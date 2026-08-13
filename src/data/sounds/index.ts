import { atmospheres } from "../atmospheres";

import type { SoundLayer } from "../../types/atmosphere";
import type { SoundReference } from "../../types/mix";

export type SoundCatalogueEntry = SoundReference & {
  atmosphereName: string;
  sound: SoundLayer;
};

export const soundCatalogue = atmospheres.flatMap((atmosphere) =>
  atmosphere.sounds.map((sound) => ({
    atmosphereId: atmosphere.id,
    atmosphereName: atmosphere.name,
    layerId: sound.id,
    sound,
  })),
) satisfies readonly SoundCatalogueEntry[];

export const preferenceCatalogue = atmospheres.map(
  ({ id: atmosphereId, sounds }) => ({
    atmosphereId,
    soundLayerIds: sounds.map(({ id }) => id),
  }),
);

export function getSoundReferenceKey({
  atmosphereId,
  layerId,
}: SoundReference): string {
  return `${atmosphereId}:${layerId}`;
}

const soundsByReference = new Map(
  soundCatalogue.map((entry) => [getSoundReferenceKey(entry), entry]),
);

export function getSoundByReference(
  reference: SoundReference,
): SoundCatalogueEntry | undefined {
  return soundsByReference.get(getSoundReferenceKey(reference));
}
