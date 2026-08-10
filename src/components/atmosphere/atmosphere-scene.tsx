import type { CSSProperties, ReactNode } from "react";

import type { Atmosphere } from "../../types/atmosphere";

import styles from "./atmosphere-scene.module.css";

type AtmosphereCustomProperties = {
  "--atmos-background": string;
  "--atmos-foreground": string;
  "--atmos-muted": string;
  "--atmos-accent": string;
  "--atmos-surface": string;
  "--atmos-overlay": string;
  "--atmos-focus": string;
  "--atmos-focal-x": string;
  "--atmos-focal-y": string;
  "--atmos-visual-background": string;
};

type AtmosphereSceneProps = {
  atmosphere: Atmosphere;
  children: ReactNode;
  className?: string;
};

function getSceneStyle(
  atmosphere: Atmosphere,
): CSSProperties & AtmosphereCustomProperties {
  const { theme, visuals } = atmosphere;

  return {
    "--atmos-background": theme.background,
    "--atmos-foreground": theme.foreground,
    "--atmos-muted": theme.muted,
    "--atmos-accent": theme.accent,
    "--atmos-surface": theme.surface,
    "--atmos-overlay": theme.overlay,
    "--atmos-focus": theme.focus,
    "--atmos-focal-x": `${visuals.focalPoint.x}%`,
    "--atmos-focal-y": `${visuals.focalPoint.y}%`,
    "--atmos-visual-background": visuals.backgroundSrc
      ? `url("${visuals.backgroundSrc}"), ${visuals.fallbackBackground}`
      : visuals.fallbackBackground,
  };
}

export function AtmosphereScene({
  atmosphere,
  children,
  className,
}: AtmosphereSceneProps) {
  const sceneClassName = className
    ? `${styles.scene} ${className}`
    : styles.scene;

  return (
    <div
      className={sceneClassName}
      data-atmosphere={atmosphere.id}
      style={getSceneStyle(atmosphere)}
    >
      <div aria-hidden="true" className={styles.background} />
      <div aria-hidden="true" className={styles.haze} />
      <div aria-hidden="true" className={styles.rain} />
      <div aria-hidden="true" className={styles.veil} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
