"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { toggleSound } from "@/lib/sound";
import {
  canPlayAction,
  canSeekTo,
  ENDPOINT_MARGIN_SECONDS,
  hasReachedTarget,
  isAtRest,
  nextLook,
  planRun,
  restingFrame,
  type Look,
  type TimeRange,
} from "@/lib/zonnebank-playback";

// Play at native speed. Above 2x Safari stops presenting anything but
// keyframes — the clip used to run at 4x and Safari painted a single frame,
// so the toggle jumped straight from light to dark with nothing in between.
// The 4x speed-up is baked into the files instead (~2.6s at 60fps), which
// every browser renders in full.
const VIDEO_SPEED = 1;

/** `HTMLMediaElement.HAVE_CURRENT_DATA` — a frame exists and can be shown. */
const HAVE_CURRENT_DATA = 2;

/**
 * How many times `canplay` may correct the resting frame before the hook stops
 * trying.
 *
 * The correction is a seek, and a seek fires `canplay`. If the element does not
 * end up where it was put — an unseekable clip clamping back to zero — those
 * two feed each other forever, which is what pinned a CPU core and left the tab
 * spinner turning. `canSeekTo` already refuses the seeks that are known to
 * clamp; this is the backstop for a browser that claims a range it will not
 * honour. Two is enough for the one case this exists to serve: a stalled clip
 * arriving late and needing its frame set once.
 */
const MAX_FRAME_RECOVERIES = 2;

/** `video.seekable` as plain pairs, which is what the playback helpers take. */
function toRanges(seekable: TimeRanges): TimeRange[] {
  return Array.from({ length: seekable.length }, (_, i) => [seekable.start(i), seekable.end(i)] as const);
}

/**
 * How long a toggle may sit waiting for data before the video counts as
 * unavailable and the control is withdrawn. Long enough for a slow phone
 * connection to deliver the mobile clip, short enough that nobody is left
 * watching a spinner that will never stop. It heals itself: if the data does
 * arrive later, `canplay` puts the toggle back.
 */
const STALL_TIMEOUT_MS = 12000;

/**
 * How much of the clip the browser may fetch ahead of being asked.
 *
 * The desktop toggle clips are 4.4–4.9 MB each and there are four cards, so
 * `auto` on approach meant roughly 18 MB pulled down for a control most
 * visitors never touch. `metadata` costs a header and a first frame — enough to
 * reveal the video layer — and the full fetch waits for a hover, which is the
 * gesture that precedes the click.
 */
type PreloadLevel = "none" | "metadata" | "auto";

export type ZonnebankVideoControls = {
  cardRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoPreload: PreloadLevel;
  handleCardPointerEnter: () => void;
  isVideoReady: boolean;
  isVideoActive: boolean;
  isVideoLoading: boolean;
  isVideoUnavailable: boolean;
  handleVideoToggle: () => void;
  handleVideoLoadedData: () => void;
  handleVideoCanPlay: () => void;
  handleVideoEnded: () => void;
  handleVideoTimeUpdate: () => void;
  handleVideoPlaying: () => void;
  handleVideoWaiting: () => void;
  handleVideoError: () => void;
};

export function useZonnebankVideo(): ZonnebankVideoControls {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // The visitor's intent, and the only thing that decides which frame the clip
  // rests on. Nothing in the transport path — an aborted play, a stalled fetch,
  // a media error — writes it. That separation is the whole point: those used
  // to reset this flag, so a hiccup during the first click knocked the toggle
  // back to light and the bed sprang open again on its own.
  const lookRef = useRef<Look>("light");
  const [look, setLook] = useState<Look>("light");

  // One id per transition. Every async callback carries the id it started with,
  // so a superseded run can never settle or re-monitor on top of a newer one.
  const runIdRef = useRef(0);
  const isRunningRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);

  // Set while a run is taking the long way to dark: out through the end of the
  // clip, back to zero, and forward into the midpoint. See `planRun`.
  const isWrappingRef = useRef(false);

  // Reset on every click, so the allowance is per intent rather than per page.
  const frameRecoveriesRef = useRef(0);

  const isVideoReadyRef = useRef(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoUnavailable, setIsVideoUnavailable] = useState(false);

  const preloadRef = useRef<PreloadLevel>("none");
  const [videoPreload, setVideoPreload] = useState<PreloadLevel>("none");

  // Written to the element as well as to state: the element is what the browser
  // acts on, and it has to change in the same tick as the `load()` beside it
  // rather than waiting for a render.
  const raisePreload = (level: PreloadLevel) => {
    if (preloadRef.current === level) return false;
    preloadRef.current = level;
    setVideoPreload(level);
    const video = videoRef.current;
    if (video) video.preload = level;
    return true;
  };

  // These three touch only refs and setState, so they hold still across
  // renders. That is what lets the visibilitychange listener below depend on
  // `settle` honestly instead of silencing the dependency check.
  const stopMonitor = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const stopStallTimer = useCallback(() => {
    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  /**
   * The single exit from a transition, however it ended: arrived, aborted,
   * refused, or never started. It puts the element on the frame the intent asks
   * for, so the picture always agrees with the button even when the animation
   * was lost.
   */
  const settle = useCallback(() => {
    stopMonitor();
    stopStallTimer();
    isRunningRef.current = false;
    isWrappingRef.current = false;
    setIsVideoLoading(false);

    const video = videoRef.current;
    if (!video) return;

    video.pause();

    // Pausing is what holds the frame; the write below only corrects one the
    // run failed to reach. Skipping it when the element is already there
    // matters more than it sounds: on an unseekable clip a redundant write is
    // not a no-op, it clamps to zero and reopens the bed. Same reason the
    // correction asks `canSeekTo` before touching anything — where the seek
    // would be refused, the frame the run stopped on is the best available.
    const frame = restingFrame(lookRef.current, video.duration);
    if (frame === null) return;
    if (isAtRest(lookRef.current, video.currentTime, video.duration)) return;
    if (!canSeekTo(toRanges(video.seekable), frame)) return;

    video.currentTime = frame;
  }, [stopMonitor, stopStallTimer]);

  /**
   * One check of where the clip has got to, shared by the two things that watch
   * a run: the rAF monitor, and `timeupdate` for when rAF is not running.
   */
  const advance = (runId: number) => {
    const video = videoRef.current;
    if (!video || runId !== runIdRef.current || !isRunningRef.current) return;

    const { currentTime, duration } = video;

    // The outbound half of a wrap. Its target is the end of the clip, not the
    // intent's frame — that one lies behind us and is only reachable by
    // starting over.
    if (isWrappingRef.current) {
      if (!Number.isFinite(duration) || currentTime < duration - ENDPOINT_MARGIN_SECONDS) return;

      isWrappingRef.current = false;
      video.currentTime = 0;
      if (video.paused) void video.play().then(undefined, () => settle());
      return;
    }

    // Playback can begin before metadata has landed, so duration is briefly
    // unknown. Keep polling rather than bailing out — a dropped monitor would
    // let the clip run past its stopping point.
    if (hasReachedTarget(lookRef.current, currentTime, duration)) settle();
  };

  const monitor = (runId: number) => {
    const video = videoRef.current;
    if (!video || runId !== runIdRef.current) return;

    advance(runId);

    // `advance` may have settled this run, and settling cancels the frame it
    // does not know about yet. Re-check before booking the next one.
    if (runId !== runIdRef.current || !isRunningRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => monitor(runId));
  };

  /**
   * Drive the element to whatever the intent currently is.
   *
   * Called from the click — inside the gesture, which is what Safari grants
   * playback on — and again from `canplay` when that click arrived before there
   * was anything to play.
   */
  const drive = () => {
    const video = videoRef.current;
    if (!video || video.error) return;

    const runId = ++runIdRef.current;
    stopMonitor();
    stopStallTimer();
    isWrappingRef.current = false;

    video.muted = true;
    video.volume = 0;
    video.playbackRate = VIDEO_SPEED;

    // Nobody is watching a hidden tab, and rAF does not run in one — the clip
    // would play on with nothing to stop it at the midpoint and end up on the
    // wrong frame. Skip the animation and go straight to the destination.
    //
    // Only where the destination can be seeked to, though. Where it cannot,
    // snapping is not on offer and stopping here would leave the picture
    // disagreeing with the button, so the run goes ahead unwatched by rAF and
    // `timeupdate` stops it instead — that one keeps firing in a hidden tab.
    if (document.hidden) {
      const resting = restingFrame(lookRef.current, video.duration);
      if (resting === null || canSeekTo(toRanges(video.seekable), resting)) {
        settle();
        return;
      }
    }

    // Nothing to play yet. Park the run, show the spinner, and let `canplay`
    // call back in — a readiness gate, where the old code guessed with three
    // blind retries and gave up by resetting the toggle.
    if (video.readyState < HAVE_CURRENT_DATA) {
      isRunningRef.current = true;
      setIsVideoLoading(true);
      stallTimerRef.current = window.setTimeout(() => {
        stallTimerRef.current = null;
        if (runId !== runIdRef.current) return;
        isRunningRef.current = false;
        setIsVideoLoading(false);
        setIsVideoUnavailable(true);
      }, STALL_TIMEOUT_MS);
      return;
    }

    const plan = planRun(
      lookRef.current,
      video.currentTime,
      video.duration,
      toRanges(video.seekable),
    );

    if (plan.kind === "settle") {
      settle();
      return;
    }

    if (plan.kind === "seek") video.currentTime = plan.frame;
    isWrappingRef.current = plan.kind === "wrap";

    isRunningRef.current = true;
    setIsVideoLoading(true);
    frameRef.current = window.requestAnimationFrame(() => monitor(runId));

    void video.play().then(
      () => {
        if (runId !== runIdRef.current) return;
        setIsVideoLoading(false);
      },
      () => {
        // Aborted, blocked by policy, or out of data. The transition is lost;
        // the intent is not, so settle() lands on the frame it asked for.
        if (runId !== runIdRef.current) return;
        settle();
      },
    );
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    const prepareCard = () => {
      // Touch has no hover to prime on, so the sound is fetched on approach for
      // every viewport. It is a fraction of the video's weight, and a click
      // that has to wait for the file lands after the gesture that asked for it.
      toggleSound.preload();

      // The video stays desktop-only on approach: four clips at 4.4–4.9 MB is
      // not something to pull down over mobile data for an optional control.
      if (isMobile) return;

      const video = videoRef.current;
      if (!video) return;

      raisePreload("metadata");
      video.load();
    };

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(prepareCard, 0);
      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        prepareCard();
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Leaving the tab mid-transition stops rAF, so the monitor that would halt
  // the clip at its midpoint stops with it while the media plays on. Finishing
  // the run immediately puts the element on the frame the intent asks for, so
  // coming back finds the card in the state it was left in rather than one
  // frame past it.
  //
  // Only when the resting frame can be seeked to, though: where it cannot,
  // finishing early would strand the picture mid-transition, so the run is left
  // to `timeupdate` — which, unlike rAF, keeps firing while the tab is hidden.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden || !isRunningRef.current) return;

      const video = videoRef.current;
      if (!video) return;

      const resting = restingFrame(lookRef.current, video.duration);
      if (resting === null || canSeekTo(toRanges(video.seekable), resting)) settle();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [settle]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (stallTimerRef.current !== null) window.clearTimeout(stallTimerRef.current);
    },
    [],
  );

  // Hovering the card is the reliable tell that the toggle is about to be
  // clicked, and it buys the fetch a head start on the click.
  //
  // `load()` restarts resource selection: it drops readyState back to
  // HAVE_NOTHING, which blanks a frame already on screen and aborts a play in
  // flight. So it only runs while neither has happened yet. Skipping it costs
  // nothing — the `play()` on click pulls the rest of the file in regardless.
  const handleCardPointerEnter = () => {
    const video = videoRef.current;
    if (!video || video.error) return;
    if (raisePreload("auto") && !isVideoReadyRef.current && !isRunningRef.current) {
      video.load();
    }
  };

  const handleVideoToggle = () => {
    // Straight away, not after the clip starts: the click is the gesture the
    // browser grants playback on, and the toggle can wait several hundred ms
    // for video to buffer. A switch that clicks late reads as a lag.
    toggleSound.play();

    const next = nextLook(lookRef.current);
    lookRef.current = next;
    setLook(next);
    frameRecoveriesRef.current = 0;

    // Touch never hovers, so for those visitors this tap is the first request
    // for the full clip.
    raisePreload("auto");
    drive();
  };

  const reveal = () => {
    const video = videoRef.current;
    if (!video || isVideoReadyRef.current) return;

    isVideoReadyRef.current = true;
    setIsVideoReady(true);

    // Only pause when no transition is running. The old code paused
    // unconditionally, which meant the first frames arriving mid-click killed
    // the play the click had just started — the browser reported that back as
    // an AbortError, and the retry budget it burned is what eventually reset
    // the toggle. A self-inflicted failure, removed at the source.
    if (!isRunningRef.current) video.pause();
  };

  const handleVideoLoadedData = () => {
    reveal();
  };

  const handleVideoCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.volume = 0;
    video.playbackRate = VIDEO_SPEED;

    // Data arrived, so the control works again whether it was withdrawn for a
    // stall or an error.
    if (!video.error) setIsVideoUnavailable(false);

    reveal();

    const action = canPlayAction(isRunningRef.current, video.paused);

    // A click that landed before there was anything to play parked its run
    // here; this is the callback it was waiting for.
    if (action === "resume-run") {
      drive();
      return;
    }

    // Idle, so the element has to agree with the intent. It will not after a
    // stall was given up on: the visitor pressed for dark, the clip arrived
    // late, and this is where the picture catches up. Snapped rather than
    // animated — that gesture is seconds old by now.
    //
    // Guarded twice over, because this seek fires the very event that runs it:
    // refused outright where the frame cannot be seeked to, and capped for a
    // browser that accepts the seek and lands somewhere else anyway.
    if (action === "recover-frame") {
      const frame = restingFrame(lookRef.current, video.duration);
      if (frame === null) return;
      if (isAtRest(lookRef.current, video.currentTime, video.duration)) return;
      if (frameRecoveriesRef.current >= MAX_FRAME_RECOVERIES) return;
      if (!canSeekTo(toRanges(video.seekable), frame)) return;

      frameRecoveriesRef.current += 1;
      video.currentTime = frame;
    }
  };

  // Backstop for a monitor that missed its endpoint — a tab throttled hard
  // enough that rAF fell behind the media, say. Every detector converges on the
  // same exit, so the element still lands on the intent's frame.
  //
  // Except mid-wrap, where the end of the clip is a waypoint rather than the
  // destination: that run restarts at zero and plays on into the midpoint.
  const handleVideoEnded = () => {
    const video = videoRef.current;

    if (isWrappingRef.current && video && isRunningRef.current) {
      isWrappingRef.current = false;
      video.currentTime = 0;
      void video.play().then(undefined, () => settle());
      return;
    }

    settle();
  };

  // rAF stops in a hidden tab and can fall behind under load, while the media
  // plays on either way. `timeupdate` fires from the media clock itself, so it
  // catches the endpoint the monitor would have missed — coarser (about four a
  // second), which is why it backs the monitor up rather than replacing it.
  const handleVideoTimeUpdate = () => {
    if (isRunningRef.current) advance(runIdRef.current);
  };

  const handleVideoPlaying = () => {
    if (isRunningRef.current) setIsVideoLoading(false);
  };

  const handleVideoWaiting = () => {
    if (isRunningRef.current) setIsVideoLoading(true);
  };

  const handleVideoError = () => {
    const video = videoRef.current;

    // A <source> fires its own error event whenever the browser passes it
    // over, and React surfaces that through the <video>'s onError. On desktop
    // the mobile-only <source> is skipped on every single load, so this ran on
    // a perfectly healthy video and tore the toggle down. The media element
    // itself only counts as broken when it has recorded an error of its own.
    if (!video || !video.error) return;

    runIdRef.current += 1;
    isRunningRef.current = false;
    isWrappingRef.current = false;
    stopMonitor();
    stopStallTimer();

    isVideoReadyRef.current = false;
    setIsVideoReady(false);
    setIsVideoLoading(false);

    // The control is withdrawn rather than left standing on a promise it cannot
    // keep; the still image is what the card falls back to. `look` is left
    // alone on purpose — it belongs to the visitor, not to the network.
    setIsVideoUnavailable(true);
  };

  return {
    cardRef,
    videoRef,
    videoPreload,
    handleCardPointerEnter,
    isVideoReady,
    isVideoActive: look === "dark",
    isVideoLoading,
    isVideoUnavailable,
    handleVideoToggle,
    handleVideoLoadedData,
    handleVideoCanPlay,
    handleVideoEnded,
    handleVideoTimeUpdate,
    handleVideoPlaying,
    handleVideoWaiting,
    handleVideoError,
  };
}
