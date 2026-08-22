"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import type { Zonnebank } from "@/data/zonnebanken-data";
import sunIcon from "@/images/zon.svg";
import sunsetIcon from "@/images/zonsondergang.svg";

export default function ZonnebankMedia({
  data,
  videoRef,
  videoPreload,
  isVideoReady,
  isVideoActive,
  isVideoAnimating,
  isVideoLoading,
  isVideoUnavailable,
  onVideoToggle,
  onVideoLoadedData,
  onVideoCanPlay,
  onVideoEnded,
  onVideoTimeUpdate,
  onVideoPlaying,
  onVideoWaiting,
  onVideoError,
}: {
  data: Zonnebank;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoPreload: "none" | "metadata" | "auto";
  isVideoReady: boolean;
  isVideoActive: boolean;
  isVideoAnimating: boolean;
  isVideoLoading: boolean;
  isVideoUnavailable: boolean;
  onVideoToggle: () => void;
  onVideoLoadedData: () => void;
  onVideoCanPlay: () => void;
  onVideoEnded: () => void;
  onVideoTimeUpdate: () => void;
  onVideoPlaying: () => void;
  onVideoWaiting: () => void;
  onVideoError: () => void;
}) {
  return (
    <div className="group relative aspect-[1.52/1] md:aspect-video md:min-h-[280px] lg:min-h-[248px] xl:min-h-[328px] rounded-[8px] lg:rounded-bl-none lg:rounded-br-none overflow-hidden">
      <div className="absolute inset-x-0 top-0 bottom-0 lg:-top-6 lg:-bottom-2">
        <Image
          src={data.image}
          alt={data.alt}
          fill
          quality={data.imageQuality}
          className="object-cover object-bottom"
          sizes="(max-width: 767px) 100vw, 50vw"
        />
        {data.desktopVideo && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload={videoPreload}
            disablePictureInPicture
            aria-hidden="true"
            onLoadedData={onVideoLoadedData}
            onCanPlay={onVideoCanPlay}
            onEnded={onVideoEnded}
            onTimeUpdate={onVideoTimeUpdate}
            onPlaying={onVideoPlaying}
            onWaiting={onVideoWaiting}
            onError={onVideoError}
            className={`absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-300 ${
              isVideoReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <source
              src={data.mobileVideo}
              media={MOBILE_QUERY}
              type="video/mp4"
            />
            <source src={data.desktopVideo} type="video/mp4" />
          </video>
        )}
      </div>
      {/* Withdrawn when the clip cannot be played — a broken source, or a fetch
          that never arrived. A control that promises a state it cannot reach is
          worse than no control; the still image carries the card on its own.
          The hook puts it back if the data turns up after all. */}
      {data.desktopVideo && !isVideoUnavailable && (
        // duration-[1283ms] matches the toggle clip's one-way length (2.566667s / 2,
        // confirmed with ffprobe across all four renders) so the button fades in step
        // with the video instead of finishing early or lagging behind it.
        <button
          type="button"
          onClick={onVideoToggle}
          disabled={isVideoAnimating}
          aria-label={
            isVideoLoading
              ? "Zonnebankvideo laden"
              : isVideoActive
              ? "Toon zonnebank in het licht"
              : "Toon zonnebank in het donker"
          }
          aria-pressed={isVideoActive}
          className={`group/toggle absolute top-3 right-3 md:top-5 md:right-5 z-10 flex size-12 touch-manipulation items-center justify-center rounded-full active:scale-95 ${
            isVideoAnimating ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {/* Circle only — the icons below sit outside it, as siblings, so
              they never inherit its hover scale. The scale grow gets its own
              fast timing on this span; background keeps the 1283ms
              tied to the video crossfade below.

              `inset-1` rather than `inset-0`: the drawn circle is 40px inside a
              button that stays 48, so the mark is smaller without touching the
              tap area — which has to clear 44 (see TAP_TARGET).

              The icons went 22 → 20 with it. Their stroke is authored at 1.25
              in the SVG and rides along with the box, so it now draws at about
              1.14px. Left alone on purpose: raising the number in the file to
              hold the old weight would change what the marks are drawn with
              everywhere they are used. */}
          <span
            aria-hidden="true"
            className={`absolute inset-1 rounded-full scale-100 group-hover/toggle:scale-110 ${
              isVideoActive && !isVideoLoading ? "bg-void" : "bg-white"
            }`}
            style={{
              // Tailwind v4's scale-* utilities set the standalone CSS `scale`
              // property, not `transform` — listing `transform` here left the
              // hover grow untransitioned (it jumped straight to 110%).
              transitionProperty: "background-color, scale",
              transitionDuration: "1283ms, 300ms",
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1), ease-out",
            }}
          />
          <span
            className={`absolute size-5 rounded-full border-2 border-black/20 border-t-black transition-opacity duration-150 ${
              isVideoLoading ? "animate-spin opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-[1283ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive || isVideoLoading
                ? "scale-75 rotate-45 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
            aria-hidden="true"
          >
            <Image src={sunIcon} alt="" width={20} height={20} />
          </span>
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-[1283ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive && !isVideoLoading
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 -rotate-45 opacity-0"
            }`}
            aria-hidden="true"
          >
            <Image src={sunsetIcon} alt="" width={20} height={16} />
          </span>
        </button>
      )}
    </div>
  );
}
