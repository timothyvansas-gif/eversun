"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// Keep the animation engine out of the initial bundle while making the same
// motion policy available to both site routes. `domMax` is required by the sheets'
// drag gestures; `strict` keeps components on the lightweight `m` API.
const loadMotionFeatures = () => import("framer-motion").then((mod) => mod.domMax);

/**
 * One shared source of truth for the visitor's OS motion preference.
 *
 * Framer Motion removes transform and layout animation for reduced-motion
 * visitors while retaining opacity and colour transitions that communicate a
 * state change. Both the homepage surface and the direct `/huidtest` route use
 * this provider, so a shared quiz link cannot silently get different motion.
 *
 * MotionValues and other imperative animations do not pass through this
 * policy; components that drive those values still guard them at the source.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
