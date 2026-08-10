import type { Atmosphere } from "../../types/atmosphere";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const colorPattern = /^(?:#[\da-f]{6}|(?:rgb|rgba|hsl|hsla)\(.+\))$/i;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid atmosphere: ${message}`);
  }
}

export function defineAtmosphere<const T extends Atmosphere>(
  atmosphere: T,
): Readonly<T> {
  assert(slugPattern.test(atmosphere.id), `invalid id "${atmosphere.id}"`);
  assert(
    slugPattern.test(atmosphere.slug),
    `invalid slug "${atmosphere.slug}"`,
  );
  assert(atmosphere.name.trim().length > 0, "name cannot be empty");
  assert(
    atmosphere.displayName.length > 0 &&
      atmosphere.displayName.every((line) => line.trim().length > 0),
    "display name must contain non-empty lines",
  );
  assert(
    atmosphere.description.trim().length > 0,
    "description cannot be empty",
  );

  for (const [role, color] of Object.entries(atmosphere.theme)) {
    assert(colorPattern.test(color), `invalid ${role} color "${color}"`);
  }

  const { x, y } = atmosphere.visuals.focalPoint;
  assert(
    Number.isFinite(x) && x >= 0 && x <= 100,
    "focal point x must be between 0 and 100",
  );
  assert(
    Number.isFinite(y) && y >= 0 && y <= 100,
    "focal point y must be between 0 and 100",
  );
  assert(
    atmosphere.visuals.fallbackBackground.trim().length > 0,
    "fallback background cannot be empty",
  );
  assert(
    !atmosphere.visuals.backgroundSrc ||
      atmosphere.visuals.backgroundSrc.startsWith("/"),
    "background source must be an absolute local path",
  );

  const soundIds = new Set<string>();
  for (const sound of atmosphere.sounds) {
    assert(slugPattern.test(sound.id), `invalid sound id "${sound.id}"`);
    assert(!soundIds.has(sound.id), `duplicate sound id "${sound.id}"`);
    assert(sound.name.trim().length > 0, `sound "${sound.id}" has no name`);
    assert(
      sound.src.startsWith("/"),
      `sound "${sound.id}" must use an absolute local path`,
    );
    assert(
      Number.isFinite(sound.defaultVolume) &&
        sound.defaultVolume >= 0 &&
        sound.defaultVolume <= 1,
      `sound "${sound.id}" volume must be between 0 and 1`,
    );
    soundIds.add(sound.id);
  }

  return atmosphere;
}
