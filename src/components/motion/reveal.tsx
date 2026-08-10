"use client";

import { motion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const calmEase = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={className}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.64, delay, ease: calmEase }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
