"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { m, animate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PROGRAMMATIC_SCROLL_EVENT } from "@/lib/scroll-to-top";
import { stackedSheetHeight, STACK_SPRING } from "./sheet-stack";
import heroImage from "@/images/hero-woman.webp";

import dynamic from "next/dynamic";
import HeroContent from "./hero-content";
const OpeningstijdenOverlay = dynamic(() => import("./openingstijden-overlay"));
const AfspraakOverlay = dynamic(() => import("./afspraak-overlay"));
const PlanJeMomentSheet = dynamic(() => import("./plan-je-moment-sheet"));

export default function HeroSection({
  onOpenMenu,
  isMenuOpen,
}: {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}) {
  const [isOpeningstijdenOpen, setIsOpeningstijdenOpen] = useState(false);
  const [isAfspraakOpen, setIsAfspraakOpen] = useState(false);
  const [isPlanJeMomentOpen, setIsPlanJeMomentOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);

  // Measured the moment the second sheet opens, while the first is still at
  // rest: how tall "Plan je moment" has to be to leave a shoulder of the
  // openingstijden sheet in view. The sheets are content-sized, so this cannot
  // be a viewport percentage — on a tall phone that would swallow the sheet
  // behind entirely.
  const openingstijdenPanelRef = useRef<HTMLDivElement>(null);
  const [stackedMinHeight, setStackedMinHeight] = useState<number | undefined>();
  const openPlanJeMomentStacked = () => {
    setStackedMinHeight(stackedSheetHeight(openingstijdenPanelRef.current));
    setIsPlanJeMomentOpen(true);
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Desktop (fine pointer) fires scroll events every frame, so the parallax
  // tracks scroll 1:1 there — any smoothing would lag behind fast jumps
  // (Cmd+↑, Home, scrollbar drags) and make the image glide into place.
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  // Touch devices fire scroll events sparsely during momentum scrolling, which
  // makes a directly-linked transform step visibly. The spring interpolates
  // between those events on every animation frame.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Touch only: during a programmatic scroll-to-top (logo tap) any parallax
  // motion reads as the image "gliding into place". So while that scroll runs
  // we pin the image at its final resting position (progress 0): the hero
  // arrives with the photo already in place, like a fresh page load.
  useEffect(() => {
    let pinned = false;
    let settleTimer: ReturnType<typeof setTimeout>;

    const release = () => {
      pinned = false;
      clearTimeout(settleTimer);
    };

    const onProgrammaticScroll = () => {
      pinned = true;
      clearTimeout(settleTimer);
      smoothProgress.set(0);
    };

    // NB: no wheel/touch release listeners — macOS trackpads keep firing
    // momentum wheel events after the click, which would drop the pin
    // immediately. If the user genuinely interrupts, the browser cancels the
    // programmatic scroll and the settle timer below releases the pin.
    const unsubscribe = scrollYProgress.on("change", () => {
      if (!pinned) return;
      // useSpring re-targets to the source on every change; keep steering it
      // back to 0 (set = spring-animated, so a partially-visible hero eases
      // into place instead of snapping).
      smoothProgress.set(0);
      clearTimeout(settleTimer);
      // No scroll updates for 200ms → arrived; smoothing resumes (progress is 0
      // at the top, so there is no visual jump on release).
      settleTimer = setTimeout(release, 200);
    });

    window.addEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
    return () => {
      unsubscribe();
      window.removeEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
      clearTimeout(settleTimer);
    };
  }, [scrollYProgress, smoothProgress]);

  // Desktop: raw 1:1 progress. Touch: spring-smoothed progress.
  const parallaxProgress = isFinePointer ? scrollYProgress : smoothProgress;

  // The image layer bleeds 30% above the section (see the m.div below), so
  // the spring can lag behind fast upward scrolls without exposing the black
  // section background. 19% of the 130%-tall layer ≈ the original 25% travel.
  const y = useTransform(parallaxProgress, [0, 1], ["0%", "5%"]);
  const scale = useTransform(parallaxProgress, [0, 1], [1, 1.05]);

  // The parallax is driven by MotionValues, so `MotionConfig reducedMotion` in
  // page-layout never sees it: that switch acts on animated props, and these are
  // values the scroll writes directly. Dropping the style leaves the photo
  // static, and with it the compositor layer below.
  const shouldReduceMotion = useReducedMotion();

  // Shared between the two sheets: 1 while the openingstijden sheet is fully
  // behind, 0 at its own size. Opening and closing spring it between the two,
  // and the drag on the sheet in front writes to it in between — so pulling
  // that sheet down grows the one behind along with the gesture instead of
  // waiting for the close. A motion value rather than state: it is written
  // every frame of a drag, which no render should have to keep up with.
  //
  // Which is why the reduced-motion gate is here too: the same switch that
  // misses the parallax misses this. Sunk is a position, not a movement, so it
  // is still set — it just arrives there, and the drag stops driving it.
  const stackDepth = useMotionValue(0);
  useEffect(() => {
    const sunk = isPlanJeMomentOpen ? 1 : 0;
    if (shouldReduceMotion) {
      stackDepth.set(sunk);
      return;
    }
    const controls = animate(stackDepth, sunk, STACK_SPRING);
    return () => controls.stop();
  }, [isPlanJeMomentOpen, stackDepth, shouldReduceMotion]);

  // `will-change` earns its layer only while the hero is on screen. It used to
  // be set unconditionally, which pinned a full-viewport GPU texture — around
  // 20 MB at 1440x900 on a 2x display — for the life of the tab, long after the
  // hero had scrolled away and its transform had stopped changing.
  //
  // framer-motion will not do this for us: measured, it leaves will-change at
  // `auto` even while these MotionValues are actively writing a transform, so
  // the hint has to be ours. The 300px margin turns the layer on before the
  // hero is reachable and lets it go well after, keeping the create/destroy
  // away from the edge of the viewport where it could show as a hitch.
  const [isHeroInView, setIsHeroInView] = useState(true);
  useEffect(() => {
    const section = containerRef.current;
    if (!section || shouldReduceMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { rootMargin: "300px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  const layerStyle = shouldReduceMotion
    ? undefined
    : { y, scale, willChange: isHeroInView ? "transform" : "auto" };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-svh lg:h-[calc(100svh-3rem)] min-[1920px]:max-h-[1000px] min-[1920px]:max-w-[1920px] min-[1920px]:mx-auto overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <m.div
          className="absolute inset-x-0 overflow-hidden top-0 h-full md:top-[-6%] md:h-[106%]"
          style={layerStyle}
        >
          <Image
            src={heroImage}
            alt="EverSun"
            fill
            priority
            fetchPriority="high"
            // Serve the original file as-is. The optimizer would re-encode the
            // (already lossy) 2400px source down further, which mobile's
            // portrait cover-crop then upscales — double generation loss
            // for a small saving. The original is the sharpest we have.
            unoptimized
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[70%_0%] md:object-[50%_0%]"
          />
        </m.div>

        {/* Mobile: darkening reaches further right (~78%) — the title/subtitle
            wrap wider here, so their right-hand words need backing. */}
        <div
          className="absolute inset-0 pointer-events-none z-10 lg:hidden"
          style={{
            background:
              "linear-gradient(0deg, rgba(225, 94, 29, 0.06) 0%, rgba(225, 94, 29, 0.06) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.64) 0%, rgba(0, 0, 0, 0.56) 38%, rgba(0, 0, 0, 0.42) 62%, rgba(0, 0, 0, 0.24) 80%, rgba(0, 0, 0, 0.00) 92%)",
          }}
        />
        {/* Desktop: text sits in the left column, so the fade can clear earlier
            (~64%) and let the photo keep full colour on the right. */}
        <div
          className="absolute inset-0 pointer-events-none z-10 hidden lg:block"
          style={{
            background:
              "linear-gradient(0deg, rgba(225, 94, 29, 0.06) 0%, rgba(225, 94, 29, 0.06) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.50) 26%, rgba(0, 0, 0, 0.32) 48%, rgba(0, 0, 0, 0.12) 62%, rgba(0, 0, 0, 0.00) 72%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
          style={{
            height: "250px",
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 8%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.33) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.13) 60%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.02) 88%, rgba(0,0,0,0) 100%)",
          }}
        />

        <HeroContent
          onOpenMenu={onOpenMenu}
          isMenuOpen={isMenuOpen}
          onOpenOpeningstijden={() => setIsOpeningstijdenOpen(true)}
          onOpenAfspraak={() => setIsAfspraakOpen(true)}
          onOpenPlanJeMoment={() => setIsPlanJeMomentOpen(true)}
          statusButtonRef={statusButtonRef}
        />
      </div>
      {/* The two stack: "Plan je moment" opens over the openingstijden sheet
          and closing it returns you there, rather than dropping you back on
          the page. */}
      <OpeningstijdenOverlay
        isOpen={isOpeningstijdenOpen}
        onClose={() => setIsOpeningstijdenOpen(false)}
        onPlanJeMoment={openPlanJeMomentStacked}
        isBehind={isPlanJeMomentOpen}
        panelRef={openingstijdenPanelRef}
        stackDepth={stackDepth}
      />
      <AfspraakOverlay
        isOpen={isAfspraakOpen}
        onClose={() => setIsAfspraakOpen(false)}
      />
      <PlanJeMomentSheet
        isOpen={isPlanJeMomentOpen}
        onClose={() => setIsPlanJeMomentOpen(false)}
        stackedMinHeight={isOpeningstijdenOpen ? stackedMinHeight : undefined}
        // Only handed over when there is a sheet behind to grow, and when
        // motion is welcome: gesture-linked scaling is the most literal reading
        // of "movement I did not ask for", the same call the bento cards make.
        stackDepth={isOpeningstijdenOpen && !shouldReduceMotion ? stackDepth : undefined}
      />
    </section>
  );
}
