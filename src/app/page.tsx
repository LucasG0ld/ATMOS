import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { AtmosphereScene } from "@/components/atmosphere/atmosphere-scene";
import { TimeGreeting } from "@/components/home/time-greeting";
import { Wordmark } from "@/components/shared/wordmark";
import { rainyApartment } from "@/data/atmospheres";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <AtmosphereScene atmosphere={rainyApartment}>
      <main className={`safe-area-frame min-h-dvh ${styles.frame}`}>
        <header className={styles.header}>
          <Wordmark />
          <p className={`text-label ${styles.context}`}>
            One room
            <br />
            one quiet moment
          </p>
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
          <Link
            className={styles.destination}
            data-atmosphere-link="rainy-apartment"
            href="/atmosphere/rainy-apartment"
          >
            <span aria-hidden="true" className={`text-label ${styles.index}`}>
              01
            </span>
            <span>
              <span className={styles.name}>{rainyApartment.name}</span>
              <span className={`text-body ${styles.description}`}>
                {rainyApartment.description}
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className={styles.icon} />
          </Link>
        </nav>
      </main>
    </AtmosphereScene>
  );
}
