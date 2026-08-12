/**
 * Frame geometry for the zonnebank toggle clips.
 *
 * Each clip is a single take that runs light → dark → light, so the two states
 * the toggle switches between are two static frames of it: 0 for light, the
 * midpoint for dark. Playing is only ever the transition between them.
 *
 * That is what makes the toggle robust. Seeking is synchronous and cannot fail,
 * while `play()` can be aborted, blocked or starved of data. So a failed
 * transition costs the animation and never the state: whatever goes wrong, the
 * element can always be put on the frame the visitor asked for.
 *
 * These helpers are pure on purpose — the hook around them owns the element and
 * the async work, and this file owns the arithmetic.
 */

export type Look = "light" | "dark";

/**
 * How close to a frame counts as being on it. One rAF tick advances the clip
 * ~17ms at 1x, so this covers a single frame of overshoot before the hook snaps
 * to the exact resting position.
 */
export const ENDPOINT_MARGIN_SECONDS = 0.04;

function hasUsableDuration(duration: number): boolean {
  return Number.isFinite(duration) && duration > 0;
}

export function nextLook(look: Look): Look {
  return look === "dark" ? "light" : "dark";
}

/**
 * The frame a look rests on, or null when the duration is not known yet and the
 * answer would be a guess. Light is frame 0 either way, so it never needs one.
 */
export function restingFrame(look: Look, duration: number): number | null {
  if (look === "light") return 0;
  if (!hasUsableDuration(duration)) return null;
  return duration / 2;
}

/**
 * Whether the element already shows what the intent asks for, in which case
 * there is nothing to animate. Light rests at both ends of the clip: the last
 * frame is the same picture as the first.
 */
export function isAtRest(look: Look, currentTime: number, duration: number): boolean {
  if (look === "light") {
    if (currentTime <= ENDPOINT_MARGIN_SECONDS) return true;
    return hasUsableDuration(duration) && currentTime >= duration - ENDPOINT_MARGIN_SECONDS;
  }

  if (!hasUsableDuration(duration)) return false;
  return Math.abs(currentTime - duration / 2) <= ENDPOINT_MARGIN_SECONDS;
}

/**
 * Where playback has to start to reach the target by running forward.
 *
 * The clip only plays one way, so a position in the wrong half would travel
 * away from the target. Mirroring onto `duration - currentTime` lands on the
 * frame that looks identical but sits in the half that ends where the intent
 * points — the visitor sees the transition continue from where it was, not
 * jump.
 */
export function startFrame(look: Look, currentTime: number, duration: number): number {
  if (!hasUsableDuration(duration)) return currentTime;

  const midpoint = duration / 2;
  if (look === "dark" && currentTime > midpoint) return duration - currentTime;
  if (look === "light" && currentTime < midpoint) return duration - currentTime;
  return currentTime;
}

/**
 * What a `canplay` event means for the element, which depends entirely on what
 * the element was doing when it fired.
 *
 * `canplay` is noisier than it looks: it fires again after every seek and every
 * rebuffer, so a transition in progress passes through it repeatedly. Treating
 * those as "the clip just became available" and snapping to the resting frame
 * yanked the picture to its destination mid-glide — for dark → light that is a
 * jump straight back to the open bed, with no transition at all.
 */
export type CanPlayAction =
  /** A click that arrived before there was data can start now. */
  | "resume-run"
  /** Idle and possibly on the wrong frame: put it where the intent points. */
  | "recover-frame"
  /** A transition is under way. Leave it alone. */
  | "ignore";

export function canPlayAction(isRunning: boolean, isPaused: boolean): CanPlayAction {
  if (!isPaused) return "ignore";
  return isRunning ? "resume-run" : "recover-frame";
}

/** Whether a running transition has arrived, margin included. */
export function hasReachedTarget(look: Look, currentTime: number, duration: number): boolean {
  if (!hasUsableDuration(duration)) return false;

  const endpoint = look === "dark" ? duration / 2 : duration;
  return currentTime >= endpoint - ENDPOINT_MARGIN_SECONDS;
}
