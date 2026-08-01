"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";

const VIDEO_SPEED = 4;
const VIDEO_PLAY_RETRY_MS = 120;
const MAX_VIDEO_PLAY_ATTEMPTS = 3;
const ENDPOINT_MARGIN_SECONDS = 0.08;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

type PlaybackTarget = "dark" | "light" | null;

export type ZonnebankVideoControls = {
  cardRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  shouldLoadVideo: boolean;
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
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia(MOBILE_QUERY).matches) return;

    const prepareVideo = () => {
      const video = videoRef.current;
      if (!video) return;

      video.preload = "auto";
      setShouldLoadVideo(true);
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

    const shouldStartLoading = !shouldLoadVideo;
    if (shouldStartLoading) {
      video.preload = "auto";
      setShouldLoadVideo(true);
    }

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
    shouldLoadVideo,
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
