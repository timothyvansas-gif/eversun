"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  init,
  transition,
  type FlowAction,
  type FlowConfig,
  type FlowEffect,
  type FlowState,
  type Transition,
} from "@/lib/huidtest/flow";
import type { QuizAnswers } from "@/lib/huidtest/types";

/**
 * The React side of the flow: it holds the state the engine hands back, runs
 * the effects the engine describes, and listens for the browser's own back
 * button.
 *
 * Deliberately thin. Anything decided here rather than in `flow.ts` is a
 * decision no test can reach, because vitest runs in node with no DOM.
 */

function run(effect: FlowEffect): void {
  switch (effect.type) {
    case "track":
      trackEvent(effect.name, effect.props);
      return;
    case "historyPush":
      window.history.pushState({ huidtest: true }, "");
      return;
    case "historyBack":
      window.history.back();
      return;
  }
}

export function useHuidtestFlow(
  shared: QuizAnswers | null,
  config: FlowConfig,
  /**
   * Called for every action that changed the screen, including the ones the
   * browser's back button starts. The UI layer turns the cause into a
   * direction; the flow has no opinion about which way anything moves.
   */
  onTransition: (transition: NonNullable<Transition>) => void,
): {
  state: FlowState;
  dispatch: (action: FlowAction) => void;
} {
  // A shared link is where this render starts: the answers were in the URL
  // before the first paint. Deriving the opening step from them beats setting
  // state in an effect, which would paint the intro and replace it a frame on.
  const opening = useMemo(() => init(shared), [shared]);
  const [state, setState] = useState<FlowState>(opening.state);

  // The engine reads the state it is transitioning from through a ref rather
  // than through the closure, so an action always sees what the one before it
  // committed instead of what the last render happened to capture.
  const stateRef = useRef(state);
  const configRef = useRef(config);
  const onTransitionRef = useRef(onTransition);

  // Kept current from a commit rather than from render, so `dispatch` can stay
  // stable — a dispatch that changed identity would resubscribe the popstate
  // listener on every render. Both are only ever read from an event handler,
  // which by definition runs after the commit that wrote them.
  useEffect(() => {
    configRef.current = config;
    onTransitionRef.current = onTransition;
  });

  const dispatch = useCallback((action: FlowAction): void => {
    const result = transition(stateRef.current, action, configRef.current);

    stateRef.current = result.state;
    setState(result.state);

    // Outside the state updater on purpose. React may call an updater more than
    // once for a single update, and effects run from inside one would be
    // performed as many times — which is exactly how the result used to be
    // reported twice.
    for (const effect of result.effects) run(effect);

    // After the state is queued, so the direction the stage reads and the step
    // it reads it for arrive in the same batch.
    if (result.transition) onTransitionRef.current(result.transition);
  }, []);

  // What a shared link owes on arrival: an exit or a finished result reports
  // itself, the same as it would have if the visitor had answered their way
  // there. Guarded by a ref rather than by the dependency array, because
  // StrictMode runs mount effects twice in development and an event reported
  // twice there is an event nobody can count.
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    for (const effect of opening.effects) run(effect);
  }, [opening]);

  // The route's back button and the one on screen have to agree, so the screen
  // one asks history and history answers here.
  const { historyBacked } = config;
  useEffect(() => {
    if (!historyBacked) return;

    const onPopState = () => dispatch({ type: "popstate" });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [historyBacked, dispatch]);

  return { state, dispatch };
}
