"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";

// Play at native speed. Above 2x Safari stops presenting anything but
// keyframes — the clip used to run at 4x and Safari painted a single frame,
// so the toggle jumped straight from light to dark with nothing in between.
// The 4x speed-up is baked into the files instead (~2.6s at 60fps), which
// every browser renders in full.
const VIDEO_SPEED = 1;
const VIDEO_PLAY_RETRY_MS = 120;
const MAX_VIDEO_PLAY_ATTEMPTS = 3;
// One rAF tick advances the clip ~17ms now that it plays at 1x, so this only
// has to cover a single frame of overshoot before finishPlayback snaps to the
// exact resting position.
const ENDPOINT_MARGIN_SECONDS = 0.04;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

type PlaybackTarget = "dark" | "light" | null;

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
  handleVideoToggle: () => void;
  handleVideoLoadedData: () => void;
  handleVideoCanPlay: () => void;
  handleVideoPlaying: () => void;
  handleVideoWaiting: () => void;
  handleVideoError: () => void;
};

export function useZonnebankVideo(): ZonnebankVideoControls {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoActiveRef = useRef(false);
  const playbackTargetRef = useRef<PlaybackTarget>(null);
  const animationFrameRef = useRef<number | null>(null);
  const revealFrameRef = useRef<number | null>(null);
  const playRetryTimerRef = useRef<number | null>(null);
  const playAttemptsRef = useRef(0);
  const playRequestIdRef = useRef(0);
  const playPromisePendingRef = useRef(false);
  const isVideoReadyRef = useRef(false);
  const preloadRef = useRef<PreloadLevel>("none");
  const [videoPreload, setVideoPreload] = useState<PreloadLevel>("none");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

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

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia(MOBILE_QUERY).matches) return;

    const prepareVideo = () => {
      const video = videoRef.current;
      if (!video) return;

      raisePreload("metadata");
      video.load();
    };

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(prepareVideo, 0);
      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        prepareVideo();
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (revealFrameRef.current !== null) {
        window.cancelAnimationFrame(revealFrameRef.current);
      }
      if (playRetryTimerRef.current !== null) {
        window.clearTimeout(playRetryTimerRef.current);
      }
    },
    [],
  );

  const stopPlaybackMonitor = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const finishPlayback = () => {
    const video = videoRef.current;
    const target = playbackTargetRef.current;
    if (!video || !target) return;

    video.pause();
    stopPlaybackMonitor();
    if (revealFrameRef.current !== null) {
      window.cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
    }

    if (target === "dark") {
      video.currentTime = video.duration / 2;
    } else {
      video.currentTime = 0;
    }

    playbackTargetRef.current = null;
    setIsVideoLoading(false);
  };

  const monitorPlayback = () => {
    const video = videoRef.current;
    const target = playbackTargetRef.current;
    if (!video || !target) return;

    // Playback can begin before metadata has landed (see startPlayback), so
    // duration is briefly unknown. Keep polling rather than bailing out — a
    // dropped monitor would let the clip run past its stopping point.
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      animationFrameRef.current = window.requestAnimationFrame(monitorPlayback);
      return;
    }

    const midpoint = video.duration / 2;
    const reachedTarget =
      target === "dark"
        ? video.currentTime >= midpoint - ENDPOINT_MARGIN_SECONDS
        : video.currentTime >= video.duration - ENDPOINT_MARGIN_SECONDS;

    if (reachedTarget) {
      finishPlayback();
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(monitorPlayback);
  };

  const attemptPlayback = () => {
    const video = videoRef.current;
    if (!video || !playbackTargetRef.current || playPromisePendingRef.current) {
      return;
    }

    video.muted = true;
    video.volume = 0;
    video.playbackRate = VIDEO_SPEED;
    playAttemptsRef.current += 1;
    playPromisePendingRef.current = true;
    const requestId = playRequestIdRef.current;

    void video.play().then(
      () => {
        if (requestId !== playRequestIdRef.current) return;
        playPromisePendingRef.current = false;
        playAttemptsRef.current = 0;
        if (isVideoReadyRef.current) setIsVideoLoading(false);
        stopPlaybackMonitor();
        animationFrameRef.current =
          window.requestAnimationFrame(monitorPlayback);
      },
      (error: unknown) => {
        if (requestId !== playRequestIdRef.current) return;
        playPromisePendingRef.current = false;
        if (!playbackTargetRef.current) return;

        if (
          isAbortError(error) &&
          playAttemptsRef.current < MAX_VIDEO_PLAY_ATTEMPTS
        ) {
          if (playRetryTimerRef.current !== null) {
            window.clearTimeout(playRetryTimerRef.current);
          }

          playRetryTimerRef.current = window.setTimeout(() => {
            playRetryTimerRef.current = null;
            attemptPlayback();
          }, VIDEO_PLAY_RETRY_MS);
          return;
        }

        playbackTargetRef.current = null;
        isVideoActiveRef.current = false;
        setIsVideoActive(false);
        setIsVideoLoading(false);
      },
    );
  };

  const startPlayback = (target: Exclude<PlaybackTarget, null>) => {
    const video = videoRef.current;
    if (!video) return;

    stopPlaybackMonitor();
    if (revealFrameRef.current !== null) {
      window.cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
    }
    if (playRetryTimerRef.current !== null) {
      window.clearTimeout(playRetryTimerRef.current);
      playRetryTimerRef.current = null;
    }

    video.pause();
    playAttemptsRef.current = 0;
    playRequestIdRef.current += 1;
    playPromisePendingRef.current = false;
    playbackTargetRef.current = target;
    setIsVideoLoading(true);

    // Touch never hovers, so for those visitors this tap is the first request
    // for the full clip.
    raisePreload("auto");

    if (target === "light" && video.currentTime <= 0.03) {
      playbackTargetRef.current = null;
      setIsVideoLoading(false);
      return;
    }

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0 &&
      video.currentTime > 0
    ) {
      const midpoint = video.duration / 2;

      if (target === "dark" && video.currentTime > midpoint) {
        video.currentTime = video.duration - video.currentTime;
      } else if (target === "light" && video.currentTime < midpoint) {
        video.currentTime = video.duration - video.currentTime;
      }
    }

    // No video.load() here on purpose: load() restarts resource selection and
    // aborts the play() below. play() pulls the media in by itself.
    //
    // Safari also only grants playback on the user gesture that asked for it,
    // and that permission does not survive an await. Asking here — inside the
    // click, before anything has buffered — claims the gesture and lets Safari
    // start as soon as the first frames arrive.
    attemptPlayback();
  };

  // Hovering the card is the reliable tell that the toggle is about to be
  // clicked, and it buys the fetch a head start on the click. `load()` is safe
  // pre-reveal: the guard in raisePreload means this only ever runs once, and
  // nothing has played yet, so there is no playback position to reset.
  //
  // Once the card has already revealed a frame (the IntersectionObserver's
  // metadata preload got there first), calling load() would still fire —
  // load() unconditionally drops readyState back to HAVE_NOTHING, blanking
  // the frame that's already on screen for a beat while it re-fetches. That
  // was the first-hover flicker. The full fetch isn't lost by skipping it:
  // attemptPlayback()'s video.play() on click pulls in the rest regardless.
  const handleCardPointerEnter = () => {
    const video = videoRef.current;
    if (!video) return;
    if (raisePreload("auto") && !isVideoReadyRef.current) video.load();
  };

  const handleVideoToggle = () => {
    const nextActiveState = !isVideoActiveRef.current;
    isVideoActiveRef.current = nextActiveState;
    setIsVideoActive(nextActiveState);
    startPlayback(nextActiveState ? "dark" : "light");
  };

  const revealLoadedVideo = () => {
    const video = videoRef.current;
    if (!video || isVideoReadyRef.current) return;

    video.pause();
    isVideoReadyRef.current = true;
    setIsVideoReady(true);

    if (playbackTargetRef.current && revealFrameRef.current === null) {
      revealFrameRef.current = window.requestAnimationFrame(() => {
        revealFrameRef.current = window.requestAnimationFrame(() => {
          revealFrameRef.current = null;
          attemptPlayback();
        });
      });
    }
  };

  const handleVideoLoadedData = () => {
    revealLoadedVideo();
  };

  const handleVideoCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.volume = 0;
    video.playbackRate = VIDEO_SPEED;
    revealLoadedVideo();

    if (
      playbackTargetRef.current &&
      isVideoReadyRef.current &&
      video.paused
    ) {
      if (revealFrameRef.current !== null) return;

      revealFrameRef.current = window.requestAnimationFrame(() => {
        revealFrameRef.current = null;
        attemptPlayback();
      });
    }
  };

  const handleVideoPlaying = () => {
    if (playbackTargetRef.current && isVideoReadyRef.current) {
      setIsVideoLoading(false);
    }
  };

  const handleVideoWaiting = () => {
    if (playbackTargetRef.current) setIsVideoLoading(true);
  };

  const handleVideoError = () => {
    const video = videoRef.current;

    // A <source> fires its own error event whenever the browser passes it
    // over, and React surfaces that through the <video>'s onError. On desktop
    // the mobile-only <source> is skipped on every single load, so this ran on
    // a perfectly healthy video and tore the toggle down: target cleared,
    // pressed state reset, playback abandoned. The media element itself only
    // counts as broken when it has recorded an error of its own.
    if (!video || !video.error) return;

    playbackTargetRef.current = null;
    playRequestIdRef.current += 1;
    playPromisePendingRef.current = false;
    isVideoActiveRef.current = false;
    stopPlaybackMonitor();
    if (revealFrameRef.current !== null) {
      window.cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
    }
    isVideoReadyRef.current = false;
    setIsVideoActive(false);
    setIsVideoLoading(false);
    setIsVideoReady(false);
  };

  return {
    cardRef,
    videoRef,
    videoPreload,
    handleCardPointerEnter,
    isVideoReady,
    isVideoActive,
    isVideoLoading,
    handleVideoToggle,
    handleVideoLoadedData,
    handleVideoCanPlay,
    handleVideoPlaying,
    handleVideoWaiting,
    handleVideoError,
  };
}
