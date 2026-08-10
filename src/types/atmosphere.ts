export type AtmosphereTheme = {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  surface: string;
  overlay: string;
  focus: string;
};

export type AtmosphereVisuals = {
  backgroundSrc?: string;
  backgroundAlt: string;
  focalPoint: {
    x: number;
    y: number;
  };
  fallbackBackground: string;
};

export type SoundLayer = {
  id: string;
  name: string;
  src: string;
  defaultVolume: number;
};

export type Atmosphere = {
  id: string;
  slug: string;
  name: string;
  displayName: readonly string[];
  description: string;
  theme: AtmosphereTheme;
  visuals: AtmosphereVisuals;
  sounds: readonly SoundLayer[];
};
