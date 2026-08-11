"use client";

import type { CSSProperties } from "react";
import { useId } from "react";

import styles from "./atmos-slider.module.css";

type SliderCustomProperties = {
  "--slider-position": string;
};

type AtmosSliderProps = {
  accessibleLabel?: string;
  disabled?: boolean;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

export function AtmosSlider({
  accessibleLabel,
  disabled = false,
  label,
  value,
  onValueChange,
}: AtmosSliderProps) {
  const id = useId();
  const normalizedValue = Math.round(Math.min(100, Math.max(0, value)));
  const sliderStyle: CSSProperties & SliderCustomProperties = {
    "--slider-position": `${normalizedValue}%`,
  };

  return (
    <div className={styles.root} style={sliderStyle}>
      <div className={styles.header}>
        <label className={`text-label ${styles.label}`} htmlFor={id}>
          {label}
        </label>
        <output
          aria-hidden="true"
          className={`text-label ${styles.value}`}
          htmlFor={id}
        >
          {normalizedValue}
        </output>
      </div>
      <input
        aria-label={accessibleLabel}
        aria-valuetext={`${normalizedValue}%`}
        className={styles.range}
        disabled={disabled}
        id={id}
        max={100}
        min={0}
        onChange={(event) => onValueChange(Number(event.currentTarget.value))}
        step={1}
        type="range"
        value={normalizedValue}
      />
    </div>
  );
}
