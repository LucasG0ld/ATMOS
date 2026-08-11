import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AtmosphereScene } from "@/components/atmosphere/atmosphere-scene";
import { LocalClock } from "@/components/clock/local-clock";
import { VisualControls } from "@/components/controls/visual-controls";
import { Reveal } from "@/components/motion/reveal";
import { AtmosphereMenu } from "@/components/navigation/atmosphere-menu";
import { PreferencesDialog } from "@/components/preferences/preferences-dialog";
import { Wordmark } from "@/components/shared/wordmark";
import { atmospheres, getAtmosphereBySlug } from "@/data/atmospheres";
import {
  FocusModeSecondary,
  FocusModeSurface,
} from "@/features/focus/focus-mode";

import styles from "./player.module.css";

type AtmospherePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return atmospheres.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: AtmospherePageProps): Promise<Metadata> {
  const { slug } = await params;
  const atmosphere = getAtmosphereBySlug(slug);

  if (!atmosphere) {
    return { title: "Atmosphere not found" };
  }

  return {
    title: atmosphere.name,
    description: atmosphere.description,
  };
}

export default async function AtmospherePage({ params }: AtmospherePageProps) {
  const { slug } = await params;
  const atmosphere = getAtmosphereBySlug(slug);

  if (!atmosphere) {
    notFound();
  }

  const atmosphereIndex = atmospheres.findIndex(
    ({ slug: catalogSlug }) => catalogSlug === atmosphere.slug,
  );

  return (
    <AtmosphereScene atmosphere={atmosphere}>
      <FocusModeSurface>
        <main className={`safe-area-frame min-h-dvh ${styles.frame}`}>
          <FocusModeSecondary>
            <header className={styles.header}>
              <Wordmark />
              <div className={styles.headerActions}>
                <AtmosphereMenu
                  atmospheres={atmospheres}
                  currentSlug={atmosphere.slug}
                />
                <PreferencesDialog />
                <Link
                  aria-label="Back to atmospheres"
                  className={`text-label ${styles.backLink}`}
                  href="/"
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                  <span className={styles.backLabel}>Back</span>
                </Link>
              </div>
            </header>
          </FocusModeSecondary>

          <section aria-labelledby="atmosphere-title" className={styles.stage}>
            <Reveal className={styles.clockColumn} delay={0.06}>
              <LocalClock className={styles.clock} />
            </Reveal>

            <div className={styles.editorial}>
              <div>
                <FocusModeSecondary>
                  <p className={`text-label ${styles.eyebrow}`}>
                    Atmosphere · {String(atmosphereIndex + 1).padStart(2, "0")}
                  </p>
                </FocusModeSecondary>
                <h1
                  aria-label={atmosphere.name}
                  className={`text-display font-normal ${styles.title}`}
                  id="atmosphere-title"
                >
                  {atmosphere.displayName.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h1>
              </div>

              <FocusModeSecondary>
                <p className={`text-body ${styles.description}`}>
                  {atmosphere.description}
                </p>
                <Link
                  className={`text-label ${styles.composeLink}`}
                  href={`/compose?scene=${encodeURIComponent(atmosphere.slug)}`}
                >
                  Create a mix
                </Link>
              </FocusModeSecondary>
            </div>

            <Reveal className={styles.controlsColumn} delay={0.28}>
              <VisualControls
                atmosphere={atmosphere}
                atmosphereName={atmosphere.name}
                key={atmosphere.id}
                sounds={atmosphere.sounds}
              />
            </Reveal>
          </section>
        </main>
      </FocusModeSurface>
    </AtmosphereScene>
  );
}
