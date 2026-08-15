"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";

/**
 * What the step area measures about itself: how wide it is, and how tall the
 * tallest question has been.
 *
 * Measurement only. This hook knows nothing about which step is showing, which
 * way anything travels, or what should be reported — give it one of those and
 * the layer that decides whether red hair ends the test would be the same layer
 * that watches for a phone being turned.
 */
export function useHuidtestStageMetrics(): {
  /** Attach to the step area. Also read directly by the swipe — see below. */
  stageRef: React.RefObject<HTMLDivElement | null>;
  stageWidth: number;
  questionStageHeight: number;
  recordQuestionHeight: (height: number) => void;
} {
  const stageRef = useRef<HTMLDivElement>(null);

  // The width a step crosses when it is not a finger moving it. Measured rather
  // than assumed, because it is also the basis of the back-swipe. Watched, since
  // a phone that turns and a panel that is not the viewport both change it.
  //
  // Not the value the gesture itself should use, though. `peekX` and the target
  // of the release animation deliberately read `stageRef.current.offsetWidth`
  // instead: those are evaluated inside a transform that does not re-run when
  // this state changes, so they have to see the width as it is at the moment
  // they are read rather than as it was at the last render.
  const [stageWidth, setStageWidth] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const sync = () => setStageWidth(stage.offsetWidth);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Questions do not all take the same number of lines, but the controls below
  // them should not move every time that copy changes. On a desktop surface we
  // keep the tallest rendered question as the stage's floor. QuestionCard
  // reports its actual size, so this follows copy, fonts and panel width rather
  // than relying on a height that can quietly go stale. Mobile deliberately
  // keeps its natural height: there the sheet scrolls and the action bar sticks
  // to its bottom edge.
  const [questionStageHeight, setQuestionStageHeight] = useState(0);
  const recordQuestionHeight = useCallback((height: number) => {
    // Read the real viewport here as well as gating the prop at the call site.
    // The quiz route can hydrate from a server render that cannot know the
    // breakpoint; a phone must never be recorded as the desktop height during
    // that handoff.
    if (window.matchMedia(MOBILE_QUERY).matches) return;
    setQuestionStageHeight((current) => (height > current ? height : current));
  }, []);

  return { stageRef, stageWidth, questionStageHeight, recordQuestionHeight };
}
