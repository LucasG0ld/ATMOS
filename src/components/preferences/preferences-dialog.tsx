"use client";

import { X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { useOptionalPreferences } from "../../features/preferences/preferences-provider";

import styles from "./preferences-dialog.module.css";

export function PreferencesDialog() {
  const preferences = useOptionalPreferences();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resetDialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resetTitleId = useId();
  const resetDescriptionId = useId();
  const [resetMessage, setResetMessage] = useState("");
  const hasSavedPreferences =
    Boolean(preferences?.favoriteAtmosphereIds.length) ||
    Boolean(preferences && Object.keys(preferences.layerVolumes).length > 0) ||
    Boolean(preferences?.savedMixes.length);

  const openDialog = () => {
    setResetMessage("");
    dialogRef.current?.showModal();
  };

  const closeDialog = () => dialogRef.current?.close();

  const resetPreferences = () => {
    preferences?.resetPreferences();
    setResetMessage("Saved preferences reset.");
    resetDialogRef.current?.close();
  };

  if (!preferences) return null;

  return (
    <>
      <button
        className={`text-label ${styles.trigger}`}
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        Preferences
      </button>

      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className={styles.dialog}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 className={`font-normal ${styles.title}`} id={titleId}>
              Preferences
            </h2>
            <button
              aria-label="Close preferences"
              className={styles.closeButton}
              onClick={closeDialog}
              type="button"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.5} />
            </button>
          </header>

          <div className={styles.content}>
            <p className="text-body" id={descriptionId}>
              Favorites, volumes and mixes are saved on this device.
            </p>
            <p className={`text-label ${styles.summary}`}>
              {hasSavedPreferences ? "Saved preferences" : "Nothing saved yet"}
            </p>
            {preferences.persistenceStatus === "unavailable" ? (
              <p className={`text-body ${styles.notice}`} role="status">
                Preferences remain available for this visit, but could not be
                saved on this device.
              </p>
            ) : null}
          </div>

          <div className={styles.footer}>
            <button
              className={`text-label ${styles.resetButton}`}
              onClick={() => resetDialogRef.current?.showModal()}
              ref={resetTriggerRef}
              type="button"
            >
              Reset saved preferences
            </button>
            <p aria-live="polite" className={styles.resetStatus}>
              {resetMessage}
            </p>
          </div>
        </div>
      </dialog>

      <dialog
        aria-describedby={resetDescriptionId}
        aria-labelledby={resetTitleId}
        className={styles.dialog}
        onClose={() => resetTriggerRef.current?.focus()}
        ref={resetDialogRef}
      >
        <div className={styles.panel}>
          <h2 className={`font-normal ${styles.title}`} id={resetTitleId}>
            Reset saved preferences?
          </h2>
          <p className="text-body" id={resetDescriptionId}>
            This removes favorites, saved volumes and all mixes from this
            device. Catalogue sounds are not deleted.
          </p>
          <div className={styles.footer}>
            <button
              className={`text-label ${styles.resetButton}`}
              onClick={() => resetDialogRef.current?.close()}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`text-label ${styles.resetButton}`}
              onClick={resetPreferences}
              type="button"
            >
              Reset everything
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
