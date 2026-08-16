"use client";

import { m } from "framer-motion";
import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";

/**
 * The fill that grows from the cursor when a filled button is hovered.
 *
 * It replaces the plain `hover:bg-void` swap the accent buttons used to do. A
 * colour that changes everywhere at once says the button noticed you; a fill
 * that arrives from where the pointer entered says it noticed *where*. The hero
 * had this on its own for a while, which is exactly the sort of thing that
 * quietly turns one button into two kinds of button.
 *
 * A hook rather than a wrapper component, because the buttons that need it are
 * not one shape: an anchor laid out on a subgrid so its icon lines up, a submit
 * button that carries a spinner and a disabled state, and the huidtest's own
 * pill. Wrapping all three in one component would mean forwarding every prop
 * each of them takes. Handing back the two handlers and the element to drop in
 * leaves each button the element it already was.
 */

/**
 * How wide the circle has to be to cover this button from this entry point.
 *
 * Measured rather than fixed. A constant big enough for the hero's 214px pill
 * left the huidtest's full-width button with a wedge of orange still showing in
 * the far corner — a circle drawn from where the pointer crossed the edge has
 * to reach the corner furthest from it, and on a wide button that corner is
 * most of the button away.
 *
 * The furthest corner is the one diagonally opposite, so the reach is the
 * hypotenuse of the two longest sides: whichever of left/right is further, and
 * whichever of top/bottom is further. Doubling it gives the diameter, since the
 * circle is centred on the pointer.
 */
function coveringSize(rect: DOMRect, x: number, y: number): number {
  const reach = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  return reach * 2;
}

/**
 * Slow enough to read as a fill arriving rather than a colour switching, with
 * most of the distance covered early: the centre of a button is under the blob
 * within about a tenth of a second, so the label is never left waiting on it.
 */
const BLOB_TRANSITION = {
  duration: 0.75,
  ease: [0.25, 1, 0.35, 1] as [number, number, number, number],
};

export function useHoverBlob({
  /** The dark fill. Overridden by the hero, which fills white instead. */
  color = "bg-void",
  /**
   * A disabled button should not light up under the pointer. Passed in rather
   * than read off the element, because an anchor has no disabled state and a
   * button's is a prop the consumer already holds.
   */
  disabled = false,
}: { color?: string; disabled?: boolean } = {}): {
  /** Spread onto the button or anchor itself. */
  hoverProps: {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
  /**
   * Render as the first child. The element needs `relative overflow-hidden`,
   * and its label needs to sit in something positioned — `relative z-10` — or
   * the blob, being absolute, paints straight over it.
   */
  blob: ReactNode;
  /** For a button that has to restyle itself under the fill, as the hero does. */
  hovered: boolean;
} {
  const [hovered, setHovered] = useState(false);

  // Where the circle is drawn from and how big it has to be, both settled at
  // the moment the pointer arrives. Kept as one piece of state so a render can
  // never pair a new origin with the size measured for the old one.
  const [circle, setCircle] = useState({ x: 0, y: 0, size: 0 });

  return {
    hovered,
    hoverProps: {
      onMouseEnter: (event) => {
        // Only where there is a real pointer. A touch device reports a single
        // synthetic hover on tap, which would leave the fill sitting there
        // after the finger has gone — and on the hero it would strand the
        // label in a colour meant for a background that is no longer under it.
        if (disabled || !window.matchMedia("(hover: hover)").matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setCircle({ x, y, size: coveringSize(rect, x, y) });
        setHovered(true);
      },
      onMouseLeave: () => setHovered(false),
    },
    blob: (
      <m.span
        aria-hidden
        className={`pointer-events-none absolute rounded-full ${color}`}
        style={{
          width: circle.size,
          height: circle.size,
          left: circle.x - circle.size / 2,
          top: circle.y - circle.size / 2,
        }}
        initial={false}
        animate={{ scale: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={BLOB_TRANSITION}
      />
    ),
  };
}
