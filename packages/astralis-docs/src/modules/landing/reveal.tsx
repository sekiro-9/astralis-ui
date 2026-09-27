"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * The reduced-motion preference may only change the transition. The server
 * cannot know it, so letting it change `initial` renders different HTML on
 * each side and fails hydration.
 */
export function useEntranceTransition(transition: Transition): Transition {
  return useReducedMotion() ? { duration: 0 } : transition;
}

/** Scroll-into-view fade-up. Wrap any section block; stagger with `delay`. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const transition = useEntranceTransition({ duration: 0.7, delay, ease: EASE });
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/** Entrance variant for above-the-fold content (no scroll trigger). */
export function Entrance({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const transition = useEntranceTransition({ duration: 0.8, delay, ease: EASE });
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
