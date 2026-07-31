"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { m } from "framer-motion";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { BTN_PILL } from "@/lib/button-styles";
import { CtaArrow } from "@/components/ui/cta-arrow";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import prestige1600 from "@/images/banken/Ergoline-Prestige-1600.webp";
import blueVision from "@/images/banken/Ergoline-Blue-Vision.webp";
import affinity600 from "@/images/banken/Ergoline-600-v2.webp";
import ergoline700 from "@/images/banken/Ergoline-770.webp";
import sunIcon from "@/images/zon.svg";
import sunsetIcon from "@/images/zonsondergang.svg";

type Zonnebank = {
  image: StaticImageData;
  imageQuality?: number;
  mobileVideo: string;
  hoverVideo?: string;
  alt: string;
  title: string;
  badge?: string;
  tag?: string;
  description: string[];
  minuten: string;
  prijs: string;
  whatsappUrl: string;
};

const ZONNEBANKEN: Zonnebank[] = [
  {
    image: prestige1600,
    mobileVideo: "/videos/zonnebanken/prestige-1600-mobile.mp4",
    hoverVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_2vENFymPevvw7Jf39D30rrOYhXr/hf_20260731_070945_1a84aa43-71ce-4d6a-8167-1fce39ca520d.mp4",
    alt: "Ergoline Prestige 1600 zonnebad",
    title: "Ergoline Prestige 1600",
    badge: "2 banken",
    description: [
      "Rood Beauty Light biedt de ultieme combinatie van een diepe, egale bruining en intensieve, hoogwaardige huidverzorging.",
      "Stem de bank via 'Personal Sunstyle' af op jouw huid: kies intensive voor maximale kracht, medium voor natuurlijk of sensitive voor mild.",
    ],
    minuten: "20 min",
    prijs: "€ 18,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Prestige%201600",
  },
  {
    image: blueVision,
    imageQuality: 90,
    mobileVideo: "/videos/zonnebanken/blue-vision-mobile.mp4",
    hoverVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_2vENFymPevvw7Jf39D30rrOYhXr/hf_20260731_070947_1e54a093-2d46-49cb-8e00-55cb073a9a43.mp4",
    alt: "Ergoline Blue Vision zonnebad",
    title: "Ergoline Blue Vision",
    badge: "2 banken",
    tag: "Populair",
    description: [
      "Activerend blauw licht stimuleert de zuurstofopname in je huid. Dit zorgt voor een direct zichtbaar en dieper bruiningsresultaat.",
      "Kies via het display jouw intensiteit: intensive voor de donkerste teint, medium voor opbouw of sensitive voor milde huidactivatie.",
    ],
    minuten: "20 min",
    prijs: "€ 19,50",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Blue%20Vision",
  },
  {
    image: ergoline700,
    mobileVideo: "/videos/zonnebanken/ergoline-770-mobile.mp4",
    hoverVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_2vENFymPevvw7Jf39D30rrOYhXr/hf_20260731_070948_eef49561-4120-4f57-8198-75209f76b96c.mp4",
    alt: "Ergoline 770 Medium zonnebad",
    title: "Ergoline 770 medium",
    description: [
      "Een vertrouwde en geliefde krachtpatser die garant staat voor een consistent, onberispelijk en egaal bruiningsresultaat.",
      "Deze bank focust op pure performance. De ideale keuze voor de ervaren zonner die gaat voor een krachtige, betrouwbare sessie zonder poespas.",
    ],
    minuten: "20 min",
    prijs: "€ 14,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20770%20medium",
  },
  {
    image: affinity600,
    imageQuality: 90,
    mobileVideo: "/videos/zonnebanken/ergoline-600-mobile.mp4",
    hoverVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_2vENFymPevvw7Jf39D30rrOYhXr/hf_20260731_070949_ee7acfed-2865-4481-9494-8b6cca0037b5.mp4",
    alt: "Ergoline Affinity 600 zonnebad",
    title: "Ergoline 600 light",
    description: [
      "Een toegankelijke en comfortabele klassieker die zorgt voor een betrouwbare, mooie en gelijkmatige bruining.",
      "Dankzij de ergonomische vormgeving en de verfrissende koeling geniet je van een ontspannen sessie met een natuurlijk resultaat als einddoel.",
    ],
    minuten: "20 min",
    prijs: "€ 12,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light",
  },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const HOVER_MEDIA_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine)";
const HOVER_VIDEO_SPEED = 4;
const REVERSE_VIDEO_SPEED = 5.5;
const REVERSE_FRAME_INTERVAL_MS = 1000 / 24;
const MOBILE_IDLE_FADE_MS = 700;
const MOBILE_VIDEO_REVEAL_MS = 120;

function isDesktopSafariBrowser() {
  const { navigator } = window;

  return (
    navigator.vendor === "Apple Computer, Inc." &&
    navigator.maxTouchPoints === 0 &&
    /Safari/i.test(navigator.userAgent) &&
    !/(Chrome|Chromium|CriOS|Edg|OPR)/i.test(navigator.userAgent)
  );
}

function AfspraakButton({
  minuten,
  prijs,
  whatsappUrl,
  className = "mt-3 md:mt-auto",
}: {
  minuten: string;
  prijs: string;
  whatsappUrl: string;
  className?: string;
}) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleClick = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      window.open(whatsappUrl, "_blank");
    } else {
      setQrOpen(true);
    }
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between md:justify-start md:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900 shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
                <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-zinc-900 text-[14px] font-sans tracking-[-0.01em]">{minuten}</span>
            </div>
            <span className="text-zinc-900 text-[15px] font-semibold font-sans tracking-[-0.01em]">{prijs}</span>
          </div>
          <button onClick={handleClick} className={`${BTN_PILL} !px-[28px] py-[10px] flex-shrink-0`}>
            Plan je moment
            <CtaArrow />
          </button>
        </div>
      </div>

      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Grid: photo on top, text below, cards side by side                  */
/* ------------------------------------------------------------------ */

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="flex-1 flex flex-col gap-6"
    >
      {children}
    </m.div>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHoveringRef = useRef(false);
  const isMobileVideoActiveRef = useRef(false);
  const reverseAnimationRef = useRef<number | null>(null);
  const mobileIdleTimerRef = useRef<number | null>(null);
  const mobilePlayTimerRef = useRef<number | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMobileVideoActive, setIsMobileVideoActive] = useState(false);
  const [useSafariImageHover, setUseSafariImageHover] = useState(false);

  useEffect(() => {
    const hoverMedia = window.matchMedia(HOVER_MEDIA_QUERY);
    const updateHoverMode = () => {
      setUseSafariImageHover(
        isDesktopSafariBrowser() && hoverMedia.matches,
      );
    };

    updateHoverMode();
    hoverMedia.addEventListener("change", updateHoverMode);
    return () => hoverMedia.removeEventListener("change", updateHoverMode);
  }, []);

  useEffect(() => {
    if (
      !data.hoverVideo ||
      !window.matchMedia(HOVER_MEDIA_QUERY).matches ||
      isDesktopSafariBrowser()
    ) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(() => {
        setShouldLoadVideo(true);
        videoRef.current?.load();
      }, 0);
      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShouldLoadVideo(true);
        videoRef.current?.load();
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [data.hoverVideo]);

  useEffect(() => {
    if (!data.mobileVideo || !window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const prepareVideo = () => {
      setShouldLoadVideo(true);
      videoRef.current?.load();
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
      { rootMargin: "300px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [data.mobileVideo]);

  useEffect(
    () => () => {
      if (reverseAnimationRef.current !== null) {
        window.cancelAnimationFrame(reverseAnimationRef.current);
      }
      if (mobileIdleTimerRef.current !== null) {
        window.clearTimeout(mobileIdleTimerRef.current);
      }
      if (mobilePlayTimerRef.current !== null) {
        window.clearTimeout(mobilePlayTimerRef.current);
      }
    },
    [],
  );

  const startForwardPlayback = () => {
    const wasReversing = reverseAnimationRef.current !== null;

    if (mobileIdleTimerRef.current !== null) {
      window.clearTimeout(mobileIdleTimerRef.current);
      mobileIdleTimerRef.current = null;
    }

    if (reverseAnimationRef.current !== null) {
      window.cancelAnimationFrame(reverseAnimationRef.current);
      reverseAnimationRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (!shouldLoadVideo) setShouldLoadVideo(true);
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();

    video.muted = true;
    video.volume = 0;
    video.playbackRate = HOVER_VIDEO_SPEED;
    if (!wasReversing && video.currentTime > 0.03) video.currentTime = 0;
    void video.play().catch(() => {
      if (!isMobileVideoActiveRef.current) return;

      isMobileVideoActiveRef.current = false;
      setIsMobileVideoActive(false);
    });
  };

  const scheduleMobilePlayback = () => {
    if (mobilePlayTimerRef.current !== null) {
      window.clearTimeout(mobilePlayTimerRef.current);
    }

    mobilePlayTimerRef.current = window.setTimeout(() => {
      mobilePlayTimerRef.current = null;

      const video = videoRef.current;
      if (!video || !isMobileVideoActiveRef.current) return;

      video.muted = true;
      video.volume = 0;
      video.playbackRate = HOVER_VIDEO_SPEED;
      void video.play().catch(() => {
        if (!isMobileVideoActiveRef.current) return;

        isMobileVideoActiveRef.current = false;
        setIsMobileVideoActive(false);
      });
    }, MOBILE_VIDEO_REVEAL_MS);
  };

  const startMobileForwardPlayback = () => {
    if (mobileIdleTimerRef.current !== null) {
      window.clearTimeout(mobileIdleTimerRef.current);
      mobileIdleTimerRef.current = null;
    }

    if (mobilePlayTimerRef.current !== null) {
      window.clearTimeout(mobilePlayTimerRef.current);
      mobilePlayTimerRef.current = null;
    }

    if (reverseAnimationRef.current !== null) {
      window.cancelAnimationFrame(reverseAnimationRef.current);
      reverseAnimationRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (!shouldLoadVideo) setShouldLoadVideo(true);

    video.pause();
    video.muted = true;
    video.volume = 0;
    video.playbackRate = HOVER_VIDEO_SPEED;
    if (video.currentTime > 0.03) video.currentTime = 0;

    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
      video.load();
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      scheduleMobilePlayback();
    }
  };

  const startReversePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    if (video.currentTime <= 0) {
      return;
    }

    const reverseStartTime = video.currentTime;
    let reverseStartTimestamp: number | null = null;
    let lastSeekTimestamp = 0;

    const playInReverse = (timestamp: number) => {
      if (isHoveringRef.current || isMobileVideoActiveRef.current) {
        reverseAnimationRef.current = null;
        return;
      }

      reverseStartTimestamp ??= timestamp;
      const elapsedSeconds = (timestamp - reverseStartTimestamp) / 1000;
      const targetTime = Math.max(
        0,
        reverseStartTime - elapsedSeconds * REVERSE_VIDEO_SPEED,
      );

      if (targetTime > 0) {
        const canSeek =
          !video.seeking &&
          timestamp - lastSeekTimestamp >= REVERSE_FRAME_INTERVAL_MS;

        if (canSeek) {
          video.currentTime = targetTime;
          lastSeekTimestamp = timestamp;
        }

        reverseAnimationRef.current =
          window.requestAnimationFrame(playInReverse);
        return;
      }

      if (video.seeking) {
        reverseAnimationRef.current =
          window.requestAnimationFrame(playInReverse);
        return;
      }

      if (video.currentTime > 0.03) {
        video.currentTime = 0;
        reverseAnimationRef.current =
          window.requestAnimationFrame(playInReverse);
        return;
      }

      reverseAnimationRef.current = null;
    };

    reverseAnimationRef.current = window.requestAnimationFrame(playInReverse);
  };

  const fadeMobileVideoToIdle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    if (mobilePlayTimerRef.current !== null) {
      window.clearTimeout(mobilePlayTimerRef.current);
      mobilePlayTimerRef.current = null;
    }

    if (reverseAnimationRef.current !== null) {
      window.cancelAnimationFrame(reverseAnimationRef.current);
      reverseAnimationRef.current = null;
    }

    if (mobileIdleTimerRef.current !== null) {
      window.clearTimeout(mobileIdleTimerRef.current);
    }

    mobileIdleTimerRef.current = window.setTimeout(() => {
      if (!isMobileVideoActiveRef.current) video.currentTime = 0;
      mobileIdleTimerRef.current = null;
    }, MOBILE_IDLE_FADE_MS);
  };

  const handleMediaEnter = () => {
    if (
      !data.hoverVideo ||
      useSafariImageHover ||
      !window.matchMedia(HOVER_MEDIA_QUERY).matches
    ) {
      return;
    }

    isHoveringRef.current = true;
    startForwardPlayback();
  };

  const handleMediaLeave = () => {
    if (
      !data.hoverVideo ||
      useSafariImageHover ||
      !window.matchMedia(HOVER_MEDIA_QUERY).matches
    ) {
      return;
    }

    isHoveringRef.current = false;
    startReversePlayback();
  };

  const handleMobileVideoToggle = () => {
    const nextActiveState = !isMobileVideoActiveRef.current;
    isMobileVideoActiveRef.current = nextActiveState;
    setIsMobileVideoActive(nextActiveState);

    if (nextActiveState) {
      startMobileForwardPlayback();
    } else {
      fadeMobileVideoToIdle();
    }
  };

  return (
    <CardWrapper>
      <div
        ref={cardRef}
        className="group flex flex-col gap-[10px] md:gap-[14px] xl:gap-[30px] xl:bg-[#FDF9F5] xl:p-10 xl:h-full xl:rounded-[12px]"
        onMouseEnter={handleMediaEnter}
        onMouseLeave={handleMediaLeave}
      >
        <div className="relative min-h-[240px] md:min-h-[280px] xl:min-h-[360px] rounded-[8px] overflow-hidden">
          <div
            className={`absolute inset-0 ${
              data.hoverVideo && !useSafariImageHover
                ? ""
                : "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:group-hover:scale-[1.03] md:group-hover:duration-300"
            }`}
          >
            <Image
              src={data.image}
              alt={data.alt}
              fill
              quality={data.imageQuality}
              className="object-cover object-bottom"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
            {data.hoverVideo && !useSafariImageHover && (
              <video
                ref={videoRef}
                muted
                playsInline
                preload={shouldLoadVideo ? "auto" : "none"}
                disablePictureInPicture
                aria-hidden="true"
                onCanPlay={() => {
                  const video = videoRef.current;
                  if (!video) return;

                  video.muted = true;
                  video.volume = 0;
                  video.playbackRate = HOVER_VIDEO_SPEED;
                  setIsVideoReady(true);

                  if (
                    window.matchMedia(MOBILE_QUERY).matches &&
                    isMobileVideoActiveRef.current
                  ) {
                    video.pause();
                    if (video.currentTime > 0.03) video.currentTime = 0;
                    scheduleMobilePlayback();
                  }
                }}
                onError={() => {
                  isMobileVideoActiveRef.current = false;
                  setIsMobileVideoActive(false);
                  setIsVideoReady(false);
                }}
                className={`absolute inset-0 h-full w-full object-cover object-bottom transition-opacity md:duration-300 md:ease-out ${
                  isMobileVideoActive
                    ? "duration-150 ease-out"
                    : "duration-700 ease-in-out"
                } ${
                  isVideoReady
                    ? isMobileVideoActive
                      ? "opacity-100"
                      : "opacity-0 md:opacity-100"
                    : "opacity-0"
                }`}
              >
                <source
                  src={data.mobileVideo}
                  media={MOBILE_QUERY}
                  type="video/mp4"
                />
                <source src={data.hoverVideo} type="video/mp4" />
              </video>
            )}
          </div>
          {data.badge && (
            <span className="absolute bottom-6 left-6 md:bottom-6 md:left-6 text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#111111]">
              {data.badge}
            </span>
          )}
          {data.hoverVideo && (
            <button
              type="button"
              onClick={handleMobileVideoToggle}
              aria-label={
                isMobileVideoActive
                  ? "Toon zonnebank in het licht"
                  : "Toon zonnebank in het donker"
              }
              aria-pressed={isMobileVideoActive}
              className={`absolute bottom-4 right-4 z-10 flex size-12 touch-manipulation items-center justify-center overflow-hidden rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-[background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 md:hidden ${
                isMobileVideoActive
                  ? "bg-black shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                  : "bg-white"
              }`}
            >
              <span
                className={`absolute flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMobileVideoActive
                    ? "scale-75 rotate-45 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                }`}
                aria-hidden="true"
              >
                <Image src={sunIcon} alt="" width={22} height={22} />
              </span>
              <span
                className={`absolute flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMobileVideoActive
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
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <h3 className="card-title text-zinc-900">{data.title}</h3>
          {data.tag && (
            <span className="shrink-0 whitespace-nowrap text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-full bg-line/30 text-zinc-900">
              {data.tag}
            </span>
          )}
        </div>
        {data.description.map((paragraph, i) => (
          <p
            key={i}
            className={`text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans ${i === 0 ? "mt-[2px] md:mt-0 xl:-mt-3" : ""}`}
          >
            {paragraph}
          </p>
        ))}
        <AfspraakButton minuten={data.minuten} prijs={data.prijs} whatsappUrl={data.whatsappUrl} />
      </div>
    </CardWrapper>
  );
}

function MobileDivider() {
  return <div className="md:hidden h-px my-2 bg-[#ece2d2]/50" />;
}

function ProductionGrid() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <ZonnebankCard data={ZONNEBANKEN[0]} />
        <MobileDivider />
        <ZonnebankCard data={ZONNEBANKEN[1]} />
      </div>
      <MobileDivider />
      <div className="flex flex-col md:flex-row gap-6">
        <ZonnebankCard data={ZONNEBANKEN[2]} />
        <MobileDivider />
        <ZonnebankCard data={ZONNEBANKEN[3]} />
      </div>
    </div>
  );
}

export default function OnzeZonnebanken() {
  return (
    <section className="w-full bg-white py-16 xl:py-24">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div id="banken" className="mb-8 xl:mb-10 scroll-mt-20 lg:scroll-mt-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-6">
              <div>
                <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
                  Onze zes zonnebanken
                </h2>
                <p className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-400 font-display mt-1">
                  voor echt comfort
                </p>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[24px] max-w-[411px] tracking-[-0.01em] md:mb-[2px]">
                Kies voor de wereldwijde standaard van Ergoline. Slimme sensoren, verfijnd comfort en een topresultaat door altijd preventief vernieuwde lampen.
              </p>
            </div>
          </div>

          <ProductionGrid />
        </div>
      </div>
    </section>
  );
}
