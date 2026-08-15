export type AtmosphereId = string;
export type SoundLayerId = string;

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
  mobileBackgroundSrc?: string;
  backgroundAlt: string;
  focalPoint: {
    x: number;
    y: number;
  };
  mobileFocalPoint?: {
    x: number;
    y: number;
  };
  fallbackBackground: string;
  texture?: "rain";
};

export type SoundLayer = {
  id: SoundLayerId;
  name: string;
  src: string;
  defaultVolume: number;
};

export type Atmosphere = {
  id: AtmosphereId;
  slug: string;
  name: string;
  displayName: readonly string[];
  description: string;
  catalogueDescription: string;
  theme: AtmosphereTheme;
  visuals: AtmosphereVisuals;
  sounds: readonly SoundLayer[];
};
