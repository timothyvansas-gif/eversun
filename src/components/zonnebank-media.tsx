"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import type { Zonnebank } from "@/data/zonnebanken-data";
import sunIcon from "@/images/zon.svg";
import sunsetIcon from "@/images/zonsondergang.svg";

export default function ZonnebankMedia({
  data,
  isDesktopSafari,
  videoRef,
  shouldLoadVideo,
  isVideoReady,
  isVideoActive,
  isVideoLoading,
  onVideoToggle,
  onVideoLoadedData,
  onVideoCanPlay,
  onVideoPlaying,
  onVideoWaiting,
  onVideoError,
}: {
  data: Zonnebank;
  isDesktopSafari: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  shouldLoadVideo: boolean;
  isVideoReady: boolean;
  isVideoActive: boolean;
  isVideoLoading: boolean;
  onVideoToggle: () => void;
  onVideoLoadedData: () => void;
  onVideoCanPlay: () => void;
  onVideoPlaying: () => void;
  onVideoWaiting: () => void;
  onVideoError: () => void;
}) {
  return (
    <div className="group relative min-h-[240px] md:min-h-[280px] xl:min-h-[360px] rounded-[8px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={data.image}
          alt={data.alt}
          fill
          quality={data.imageQuality}
          className={`object-cover object-bottom ${
            isDesktopSafari
              ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
              : ""
          }`}
          sizes="(max-width: 767px) 100vw, 50vw"
        />
        {data.desktopVideo && !isDesktopSafari && (
          <video
            ref={videoRef}
            muted
            playsInline
            poster={data.image.src}
            preload={shouldLoadVideo ? "auto" : "none"}
            disablePictureInPicture
            aria-hidden="true"
            onLoadedData={onVideoLoadedData}
            onCanPlay={onVideoCanPlay}
            onPlaying={onVideoPlaying}
            onWaiting={onVideoWaiting}
            onError={onVideoError}
            className={`absolute inset-0 h-full w-full object-cover object-bottom ${
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
      {data.badge && (
        <span className="absolute bottom-6 left-6 md:bottom-6 md:left-6 text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#111111]">
          {data.badge}
        </span>
      )}
      {data.desktopVideo && !isDesktopSafari && (
        <button
          type="button"
          onClick={onVideoToggle}
          aria-label={
            isVideoLoading
              ? "Zonnebankvideo laden"
              : isVideoActive
              ? "Toon zonnebank in het licht"
              : "Toon zonnebank in het donker"
          }
          aria-pressed={isVideoActive}
          className={`absolute bottom-4 right-4 z-10 flex size-12 touch-manipulation items-center justify-center overflow-hidden rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-[background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 ${
            isVideoActive && !isVideoLoading
              ? "bg-black shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
              : "bg-white"
          }`}
        >
          <span
            className={`absolute size-5 rounded-full border-2 border-black/20 border-t-black transition-opacity duration-150 ${
              isVideoLoading ? "animate-spin opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive || isVideoLoading
                ? "scale-75 rotate-45 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
            aria-hidden="true"
          >
            <Image src={sunIcon} alt="" width={22} height={22} />
          </span>
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive && !isVideoLoading
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 -rotate-45 opacity-0"
            }`}
            aria-hidden="true"
          >
            <Image src={sunsetIcon} alt="" width={22} height={18} />
          </span>
        </button>
      )}
    </div>
  );
}
