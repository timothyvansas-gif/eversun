"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import type { Zonnebank } from "@/data/zonnebanken-data";
import sunIcon from "@/images/zon.svg";
import sunsetIcon from "@/images/zonsondergang.svg";

// Banks with a different crop override this through `desktopFocus`.
const DESKTOP_FOCUS = "lg:object-[50%_120%]";

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
    // The unclipped wrapper lets the toggle overlap the clipped media box.
    <div className="relative w-full">
      {/* Explicit width prevents WebKit deriving an oversized width from aspect-ratio + min-height. */}
      <div
        className="group relative w-full aspect-[1.52/1] md:aspect-video md:min-h-[280px] lg:min-h-[248px] xl:min-h-[328px] rounded-[12px] lg:rounded-[8px] lg:rounded-bl-none lg:rounded-br-none overflow-hidden"
        // Force rounded clipping on WebKit's separate video layer.
        style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
      >
        <div className="absolute inset-x-0 top-0 bottom-0 lg:-top-6 lg:-bottom-2">
          <Image
            src={data.image}
            alt={data.alt}
            fill
            quality={data.imageQuality}
            className={`object-cover object-bottom ${data.desktopFocus ?? DESKTOP_FOCUS}`}
            sizes="(max-width: 767px) 100vw, 50vw"
            draggable={false}
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
              className={`absolute inset-0 h-full w-full object-cover object-bottom ${data.desktopFocus ?? DESKTOP_FOCUS} transition-opacity duration-300 ${
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
      </div>
      {/* Hide the control when its video cannot be played. */}
      {data.desktopVideo && !isVideoUnavailable && (
        // 1283ms matches half of the ping-pong clip, keeping UI and video in sync.
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
          // Keep the toggle above the overlapping panel; both directions use a damped overshoot.
          className={`group/toggle absolute top-3 right-3 md:top-5 md:right-5 lg:top-auto lg:-bottom-3 lg:right-6 lg:z-20 lg:transition-transform lg:duration-500 lg:ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:group-hover/card:-translate-y-4 lg:group-hover/card:duration-300 lg:group-hover/card:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none z-10 flex size-12 touch-manipulation items-center justify-center rounded-full active:scale-95 ${
            isVideoAnimating ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {/* Scale only the painted circle, preserving the 48px hit area and icon size. */}
          <span
            aria-hidden="true"
            className={`absolute inset-1 rounded-full scale-100 group-hover/toggle:scale-110 lg:scale-110 lg:group-hover/toggle:scale-[1.3] ${
              isVideoActive && !isVideoLoading ? "bg-void" : "bg-brand"
            }`}
            style={{
              // Tailwind's scale utilities animate the standalone `scale` property.
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
