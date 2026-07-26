"use client";

import { m } from "framer-motion";

const LINE = "h-[1.5px] bg-surface-page rounded-full origin-center";
const T = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// Lines sit in a `flex flex-col items-end gap-[5px]` container (1.5px tall each,
// 5px gaps) → outer line centers are ±6.5px from the middle. Morphing to a close
// icon: the outer lines slide to the middle and rotate into a cross, the middle
// line collapses. `open={false}` leaves a plain hamburger (mobile / sticky nav).
export default function HamburgerIcon({ open = false }: { open?: boolean }) {
  return (
    <>
      <m.span
        className={`w-6 ${LINE}`}
        animate={{ rotate: open ? 45 : 0, y: open ? 6.5 : 0 }}
        transition={T}
      />
      <m.span
        className={`w-4 ${LINE}`}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
        transition={T}
      />
      <m.span
        className={`w-6 ${LINE}`}
        animate={{ rotate: open ? -45 : 0, y: open ? -6.5 : 0 }}
        transition={T}
      />
    </>
  );
}
