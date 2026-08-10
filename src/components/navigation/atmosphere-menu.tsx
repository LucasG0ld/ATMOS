"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import type { Atmosphere } from "../../types/atmosphere";

import styles from "./atmosphere-menu.module.css";

type AtmosphereMenuProps = {
  atmospheres: readonly Atmosphere[];
  currentSlug: string;
};

export function AtmosphereMenu({
  atmospheres,
  currentSlug,
}: AtmosphereMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentLinkRef = useRef<HTMLAnchorElement>(null);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    currentLinkRef.current?.focus();
  };

  const closeMenu = () => dialogRef.current?.close();

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={`text-label ${styles.trigger}`}
        onClick={openMenu}
        ref={triggerRef}
        type="button"
      >
        Atmospheres
      </button>

      <dialog
        aria-labelledby="atmosphere-menu-title"
        className={styles.dialog}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2
              className={`text-lead font-normal ${styles.title}`}
              id="atmosphere-menu-title"
            >
              Atmospheres
            </h2>
            <button
              aria-label="Close atmospheres"
              className={styles.closeButton}
              onClick={closeMenu}
              type="button"
            >
              <X aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </header>

          <nav aria-label="Choose an atmosphere">
            <ol className={styles.list}>
              {atmospheres.map((atmosphere, index) => {
                const isCurrent = atmosphere.slug === currentSlug;

                return (
                  <li key={atmosphere.id}>
                    <Link
                      aria-label={
                        isCurrent
                          ? `${atmosphere.name}, current atmosphere`
                          : undefined
                      }
                      aria-current={isCurrent ? "page" : undefined}
                      className={styles.link}
                      href={`/atmosphere/${atmosphere.slug}`}
                      onClick={closeMenu}
                      ref={isCurrent ? currentLinkRef : undefined}
                    >
                      <span
                        aria-hidden="true"
                        className={`text-label ${styles.index}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.name}>{atmosphere.name}</span>
                      {isCurrent ? (
                        <span className={`text-label ${styles.current}`}>
                          Current
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </dialog>
    </>
  );
}
