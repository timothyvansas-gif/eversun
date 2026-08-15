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
 * How close to a state counts as already showing that state. This is deliberately
 * a visual tolerance rather than a canonical resting position: the hook may use
 * it to avoid replaying an imperceptible tail, but still normalises the idle
 * element to the exact frame returned by `restingFrame`.
 */
export const ENDPOINT_MARGIN_SECONDS = 0.04;

/**
 * The clips are 60fps. A frame callback reports the presentation timestamp at
 * the start of a frame, so the final displayed frame sits roughly one frame
 * before `duration` rather than exactly on it.
 */
export const PRESENTED_FRAME_MARGIN_SECONDS = 0.02;

/** Floating-point tolerance for an exact, canonical resting-frame check. */
const CANONICAL_FRAME_EPSILON_SECONDS = 0.001;

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
 * Whether the media clock is on the one canonical idle frame for this look.
 *
 * Unlike `isAtRest`, the end of the clip is not a canonical light frame. Using
 * frame zero for every light rest makes the next transition deterministic.
 */
export function isOnRestingFrame(look: Look, currentTime: number, duration: number): boolean {
  const frame = restingFrame(look, duration);
  return frame !== null && Math.abs(currentTime - frame) <= CANONICAL_FRAME_EPSILON_SECONDS;
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
  // Container durations are rounded independently from frame timestamps. On
  // iOS the real dark frame is 1.283333s while half the reported 2.567s duration
  // is 1.283500s. Treating that sub-frame difference as the wrong half issues a
  // needless seek, which restarts Safari's hardware decoder and flashes the
  // closed frame before opening. Only mirror when the picture is meaningfully
  // across the midpoint.
  if (look === "dark" && currentTime > midpoint + ENDPOINT_MARGIN_SECONDS) {
    return duration - currentTime;
  }
  if (look === "light" && currentTime < midpoint - ENDPOINT_MARGIN_SECONDS) {
    return duration - currentTime;
  }
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

/**
 * Whether a presented frame has reached the target.
 *
 * Dark has a real frame at the midpoint, so it should be shown before stopping.
 * Light lives on the clip's final frame, whose presentation timestamp is one
 * 60fps frame before the media duration.
 */
export function hasReachedTarget(look: Look, currentTime: number, duration: number): boolean {
  if (!hasUsableDuration(duration)) return false;

  const endpoint = look === "dark" ? duration / 2 : duration;
  const margin = look === "light" ? PRESENTED_FRAME_MARGIN_SECONDS : CANONICAL_FRAME_EPSILON_SECONDS;
  return currentTime >= endpoint - margin;
}

/** A `TimeRanges` list flattened into plain pairs, so this file stays testable. */
export type TimeRange = readonly [start: number, end: number];

/**
 * Whether the element can actually be put on a frame, which is not the same
 * question as whether the frame exists.
 *
 * Seeking needs byte ranges. A server that answers a `Range` request with the
 * whole file — Cloudflare Workers' static assets do exactly that — leaves the
 * clip fully buffered and still unseekable: Chrome reports `seekable` as
 * `[0, 0]` and clamps every seek to zero. Frame zero is the bed in the light,
 * so an unchecked `currentTime = midpoint` did not land on dark, it jumped
 * back to open. Worse, the seek fired `canplay`, whose recovery seeked again,
 * and the pair span until the tab was closed.
 *
 * So every write to `currentTime` asks here first. Zero stays reachable even
 * on those servers, which is what keeps the light frame and the wrap in
 * `planRun` working.
 */
export function canSeekTo(seekable: readonly TimeRange[], target: number): boolean {
  if (!Number.isFinite(target)) return false;

  return seekable.some(
    ([start, end]) =>
      target >= start - ENDPOINT_MARGIN_SECONDS && target <= end + ENDPOINT_MARGIN_SECONDS,
  );
}

/**
 * How a transition can get from where the element is to where the intent
 * points, given what the element is allowed to seek.
 */
export type RunPlan =
  /** Jump to the frame that runs into the target, then roll forward. */
  | { kind: "seek"; frame: number }
  /** Already in the right half: rolling forward arrives on its own. */
  | { kind: "play" }
  /**
   * Wrong half, and the frame that would fix it cannot be seeked to. Run out
   * the clip, restart at zero — the one seek every server allows — and play
   * into the target from there. Costs a lap; keeps the state honest.
   */
  | { kind: "wrap" }
  /** The picture already shows what was asked. Nothing to animate. */
  | { kind: "settle" };

export function planRun(
  look: Look,
  currentTime: number,
  duration: number,
  seekable: readonly TimeRange[],
): RunPlan {
  if (isAtRest(look, currentTime, duration)) return { kind: "settle" };

  const from = startFrame(look, currentTime, duration);
  if (from === currentTime) return { kind: "play" };
  if (canSeekTo(seekable, from)) return { kind: "seek", frame: from };

  // Light rests on the last frame as well as the first, so running the clip out
  // reaches it without seeking at all. Dark only exists at the midpoint, which
  // this half has already passed — that one has to go round.
  if (look === "light") return { kind: "play" };
  return canSeekTo(seekable, 0) ? { kind: "wrap" } : { kind: "play" };
}
