"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  createVisualPreloader,
  type BoundedVisualPreloader,
} from "../../features/preloading/media-preloader";
import type { Atmosphere } from "../../types/atmosphere";
import { useOptionalPreferences } from "../../features/preferences/preferences-provider";
import { AtmosphereScene } from "../atmosphere/atmosphere-scene";
import { PreferencesDialog } from "../preferences/preferences-dialog";
import { Wordmark } from "../shared/wordmark";
import { TimeGreeting } from "./time-greeting";

import styles from "../../app/home.module.css";

type AtmosphereCatalogueProps = {
  atmospheres: readonly Atmosphere[];
};

export function AtmosphereCatalogue({ atmospheres }: AtmosphereCatalogueProps) {
  const preferences = useOptionalPreferences();
  const [previewSlug, setPreviewSlug] = useState(atmospheres[0]?.slug ?? "");
  const [navigating, setNavigating] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualPreloaderRef = useRef<BoundedVisualPreloader | null>(null);
  const previewAtmosphere =
    atmospheres.find(({ slug }) => slug === previewSlug) ?? atmospheres[0];

  useEffect(
    () => () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      visualPreloaderRef.current?.cancel();
    },
    [],
  );

  if (!previewAtmosphere) return null;

  const clearPreviewTimer = () => {
    if (!previewTimerRef.current) return;
    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
  };

  const preloadVisual = (atmosphere: Atmosphere) => {
    visualPreloaderRef.current ??= createVisualPreloader();
    visualPreloaderRef.current.preload(atmosphere);
  };

  const previewAfterIntent = (atmosphere: Atmosphere, pointerType: string) => {
    if (pointerType !== "mouse") return;
    clearPreviewTimer();
    preloadVisual(atmosphere);
    previewTimerRef.current = setTimeout(() => {
      setPreviewSlug(atmosphere.slug);
      previewTimerRef.current = null;
    }, 100);
  };

  const previewImmediately = (atmosphere: Atmosphere) => {
    clearPreviewTimer();
    preloadVisual(atmosphere);
    setPreviewSlug(atmosphere.slug);
  };

  return (
    <AtmosphereScene atmosphere={previewAtmosphere}>
      <main
        className={`safe-area-frame min-h-dvh ${styles.frame}`}
        data-navigating={navigating ? "true" : "false"}
      >
        <header className={styles.header}>
          <Wordmark />
          <div className={styles.headerMeta}>
            <PreferencesDialog />
            <p className={`text-label ${styles.context}`}>
              Four places
              <br />
              one quiet moment
            </p>
          </div>
        </header>

        <section aria-labelledby="home-title" className={styles.hero}>
          <div className={`text-body ${styles.greeting}`}>
            <TimeGreeting />
          </div>
          <h1
            className={`text-lead font-normal ${styles.question}`}
            id="home-title"
          >
            What atmosphere do you need today?
          </h1>
        </section>

        <nav aria-label="Atmospheres" className={styles.navigation}>
          <ol className={styles.destinationList}>
            {atmospheres.map((atmosphere, index) => {
              const isPreviewActive = atmosphere.slug === previewSlug;
              const isFavorite = Boolean(
                preferences?.isHydrated &&
                preferences.favoriteAtmosphereIds.includes(atmosphere.id),
              );

              return (
                <li key={atmosphere.id}>
                  <Link
                    className={styles.destination}
                    data-atmosphere-link={atmosphere.slug}
                    data-preview-active={isPreviewActive ? "true" : "false"}
                    href={`/atmosphere/${atmosphere.slug}`}
                    onClick={() => setNavigating(true)}
                    onFocus={() => previewImmediately(atmosphere)}
                    onPointerEnter={(event) =>
                      previewAfterIntent(atmosphere, event.pointerType)
                    }
                    onPointerLeave={clearPreviewTimer}
                  >
                    <span
                      aria-hidden="true"
                      className={`text-label ${styles.index}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className={styles.nameRow}>
                        <span className={styles.name}>{atmosphere.name}</span>
                        <span
                          className={`text-label ${styles.savedMarker}`}
                          data-saved={isFavorite ? "true" : "false"}
                        >
                          Saved
                        </span>
                      </span>
                      <span className={`text-body ${styles.description}`}>
                        {atmosphere.description}
                      </span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className={styles.icon} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </main>
    </AtmosphereScene>
  );
}
