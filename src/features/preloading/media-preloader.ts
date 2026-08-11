import type { Atmosphere } from "../../types/atmosphere";

type ConnectionInformation = {
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
};

type NetworkNavigator = Pick<Navigator, "onLine"> & {
  connection?: ConnectionInformation;
};

type PreloadImage = {
  decoding: "async" | "auto" | "sync";
  fetchPriority: "high" | "low" | "auto";
  removeAttribute(name: string): void;
  src: string;
};

type VisualPreloaderDependencies = {
  createImage: () => PreloadImage;
  matchesMobile: () => boolean;
};

export function allowsAudioPreload(navigatorLike: NetworkNavigator): boolean {
  if (!navigatorLike.onLine) return false;
  const connection = navigatorLike.connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  if (["slow-2g", "2g"].includes(connection.effectiveType ?? "")) {
    return false;
  }
  return connection.downlink === undefined || connection.downlink >= 1.5;
}

export class BoundedVisualPreloader {
  private image?: PreloadImage;
  private source?: string;

  constructor(private readonly dependencies: VisualPreloaderDependencies) {}

  preload(atmosphere: Atmosphere): void {
    const { visuals } = atmosphere;
    const source =
      this.dependencies.matchesMobile() && visuals.mobileBackgroundSrc
        ? visuals.mobileBackgroundSrc
        : visuals.backgroundSrc;
    if (!source || source === this.source) return;

    this.cancel();
    const image = this.dependencies.createImage();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.src = source;
    this.image = image;
    this.source = source;
  }

  cancel(): void {
    this.image?.removeAttribute("src");
    this.image = undefined;
    this.source = undefined;
  }
}

export function createVisualPreloader(): BoundedVisualPreloader {
  return new BoundedVisualPreloader({
    createImage: () => new Image(),
    matchesMobile: () =>
      typeof matchMedia === "function" &&
      matchMedia("(max-width: 48rem)").matches,
  });
}
