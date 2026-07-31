"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

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
  const decodedFrameCallbackRef = useRef<{
    id: number;
    kind: "animation" | "video";
  } | null>(null);
  const playRetryTimerRef = useRef<number | null>(null);
  const playAttemptsRef = useRef(0);
  const playRequestIdRef = useRef(0);
  const playPromisePendingRef = useRef(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

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
      { rootMargin: "1200px 0px" },
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
      const decodedFrameCallback = decodedFrameCallbackRef.current;
      const video = videoRef.current;
      if (decodedFrameCallback?.kind === "animation") {
        window.cancelAnimationFrame(decodedFrameCallback.id);
      } else if (decodedFrameCallback && video) {
        video.cancelVideoFrameCallback(decodedFrameCallback.id);
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
    if (!video || !target || !Number.isFinite(video.duration)) return;

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
    setIsVideoReady(true);
    playAttemptsRef.current += 1;
    playPromisePendingRef.current = true;
    const requestId = playRequestIdRef.current;

    void video.play().then(
      () => {
        if (requestId !== playRequestIdRef.current) return;
        playPromisePendingRef.current = false;
        playAttemptsRef.current = 0;
        setIsVideoLoading(false);
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

    if (!shouldLoadVideo) {
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

    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
      attemptPlayback();
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlayback();
    }
  };

  const handleVideoToggle = () => {
    const nextActiveState = !isVideoActiveRef.current;
    isVideoActiveRef.current = nextActiveState;
    setIsVideoActive(nextActiveState);
    startPlayback(nextActiveState ? "dark" : "light");
  };

  const handleVideoLoadedData = () => {
    const video = videoRef.current;
    if (!video || decodedFrameCallbackRef.current) return;

    const markFrameReady = () => {
      decodedFrameCallbackRef.current = null;
      setIsVideoReady(true);
    };

    if (typeof video.requestVideoFrameCallback === "function") {
      const id = video.requestVideoFrameCallback(markFrameReady);
      decodedFrameCallbackRef.current = { id, kind: "video" };
      if (video.currentTime === 0) video.currentTime = 0.001;
      return;
    }

    const id = window.requestAnimationFrame(() => {
      const nextId = window.requestAnimationFrame(markFrameReady);
      decodedFrameCallbackRef.current = { id: nextId, kind: "animation" };
    });
    decodedFrameCallbackRef.current = { id, kind: "animation" };
    if (video.currentTime === 0) video.currentTime = 0.001;
  };

  const handleVideoCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.volume = 0;
    video.playbackRate = VIDEO_SPEED;

    if (playbackTargetRef.current && video.paused) {
      if (revealFrameRef.current !== null) return;

      revealFrameRef.current = window.requestAnimationFrame(() => {
        revealFrameRef.current = null;
        attemptPlayback();
      });
    }
  };

  const handleVideoPlaying = () => {
    if (playbackTargetRef.current) setIsVideoLoading(false);
  };

  const handleVideoWaiting = () => {
    if (playbackTargetRef.current) setIsVideoLoading(true);
  };

  const handleVideoError = () => {
    playbackTargetRef.current = null;
    playRequestIdRef.current += 1;
    playPromisePendingRef.current = false;
    isVideoActiveRef.current = false;
    stopPlaybackMonitor();
    if (revealFrameRef.current !== null) {
      window.cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
    }
    const decodedFrameCallback = decodedFrameCallbackRef.current;
    const video = videoRef.current;
    if (decodedFrameCallback?.kind === "animation") {
      window.cancelAnimationFrame(decodedFrameCallback.id);
    } else if (decodedFrameCallback && video) {
      video.cancelVideoFrameCallback(decodedFrameCallback.id);
    }
    decodedFrameCallbackRef.current = null;
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
