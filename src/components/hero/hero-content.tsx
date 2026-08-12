"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { m } from "framer-motion";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import DesktopMenu from "./desktop-menu";
import HeroLines from "./hero-lines";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
import { MOBILE_MENU_ID } from "@/lib/nav-items";
import { TAP_TARGET } from "@/lib/button-styles";
import { scrollToTop } from "@/lib/scroll-to-top";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// Two entrances, because the two breakpoints show different things. On desktop
// the right-hand side goes first: header and review row share one cue, the
// avatars then glide out of their stack (HeroReviews' own ENTRANCE_DELAY), and
// the left column only starts once that glide is nearly home — so the eye is
// handed from the row to the title instead of watching both at once.
// The avatar that travels furthest starts at 0.75s and takes 0.85s, so 1.0
// lands the title a third of the way into that last glide — the row has done
// enough of its unpacking to have been read, and the two overlap rather than
// queue.
// Mobile has no avatar row to wait for, so it keeps the original cadence.
const DESKTOP_DELAYS = { header: 0.2, reviews: 0.2, title: 1, sub: 1.15, buttons: 1.3, status: 1.3 };
const MOBILE_DELAYS = { header: 0.2, reviews: 0.7, title: 0.3, sub: 0.6, buttons: 0.7, status: 0.9 };

// Desktop-only gap between the avatars settling and the title underline
// drawing. The two used to land within the same beat, so the underline read
// as part of the dock's own landing rather than a separate cue.
const UNDERLINE_EXTRA_DELAY_MS = 400;

const DESKTOP = "(min-width: 1024px)";

// One store for the whole schedule, rather than a viewport boolean the render
// then maps: the server has no viewport, so the first paint has to be honest
// about not knowing yet (null) instead of guessing mobile and swapping delays
// out from under an animation that already started. Reading breakpoint and
// schedule from a single snapshot also keeps them from resolving a render
// apart. Both constants are module-level, so the snapshot is reference-stable
// and React does not see a new value every render.
function useEntranceDelays(): typeof DESKTOP_DELAYS | null {
  const subscribe = useCallback((onChange: () => void) => {
    const mql = window.matchMedia(DESKTOP);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(DESKTOP).matches ? DESKTOP_DELAYS : MOBILE_DELAYS),
    () => null,
  );
}


export default function HeroContent({ onOpenMenu, isMenuOpen, onOpenOpeningstijden, onOpenAfspraak, onOpenPlanJeMoment, statusButtonRef }: { onOpenMenu: () => void; isMenuOpen: boolean; onOpenOpeningstijden: () => void; onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void; statusButtonRef: React.RefObject<HTMLButtonElement | null> }) {
  // Desktop menu is a hero-scoped dropdown (see DesktopMenu), independent of the
  // mobile slide-in/push flow that `onOpenMenu` drives.
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const desktopToggleRef = useRef<HTMLButtonElement>(null);

  // The title underlines wait for the review avatars to finish gliding into
  // place (HeroReviews fires onSettled). The timer is the backstop for a cue
  // that may never come — reduced motion skips the glide entirely — so the
  // underlines draw either way, on whichever comes first.
  const [reviewsSettled, setReviewsSettled] = useState(false);
  useEffect(() => {
    // The avatar row is desktop-only. It still mounts on mobile (display:none
    // does not stop framer animating), but nobody is watching it there, so the
    // underlines need not wait out its full entrance.
    const isDesktop = window.matchMedia(DESKTOP).matches;
    const t = setTimeout(() => setReviewsSettled(true), isDesktop ? 3200 + UNDERLINE_EXTRA_DELAY_MS : 1800);
    return () => clearTimeout(t);
  }, []);
  // Until the breakpoint is known every element stays at `hidden`, so nothing
  // starts on the wrong clock. It costs a frame before the first fade — the
  // header's own 0.2s delay covers it — not a visible pause.
  const delays = useEntranceDelays();
  const show = delays ? "visible" : "hidden";
  const d = delays ?? DESKTOP_DELAYS;

  // Fires from HeroReviews' onSettled callback, not an effect body, so this is
  // not the setState-in-effect pattern the lint rule flags. Mobile has no dock
  // to wait on and keeps firing immediately.
  const onReviewsSettled = () => {
    if (delays === DESKTOP_DELAYS) {
      setTimeout(() => setReviewsSettled(true), UNDERLINE_EXTRA_DELAY_MS);
    } else {
      setReviewsSettled(true);
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col z-20"
      style={{
        paddingTop: "calc(clamp(1.5rem, 4vw, 2.5rem) + env(safe-area-inset-top))",
        paddingBottom: "clamp(1.5rem, 4vw, 2.5rem)",
        paddingLeft: "clamp(1.5rem, 4vw, 3.5rem)",
        paddingRight: "clamp(1.5rem, 4vw, 3.5rem)"
      }}
    >
      <div
        className="relative min-h-0 max-w-[1280px] w-full mx-auto flex-1 flex flex-col justify-between lg:justify-start"
      >
        {/* Desktop Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={delays ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.8, delay: d.header }}
          className="hidden lg:flex items-center justify-between"
        >
          {/* Status sits with the logo, not opposite it: both say who is
              speaking and whether the studio is open right now, and the left
              column is where the gradient is deepest — the one place on this
              photo where 15px text keeps its footing. */}
          <div className="flex items-center gap-5">
            {/* -mr-[8.5px] cancels the empty box the wordmark leaves inside its
                own SVG: the N ends 8.5px short of the artboard's right edge, so
                the flex gap alone put 28.5px of air after the logo against 20px
                after the rule. The margin hands spacing back to the one gap
                value, and both sides then measure what they look. */}
            <Logo className="h-[52px] w-auto -mr-[8.5px]" textColor="var(--color-hero-ink)" iconColor="var(--color-hero-ink)" iconOpacity={0.8} iconScale={44 / 52} textOffsetX={-8} />
            {/* 18px, which is the cap height of the N in the wordmark beside it
                — measured off the rendered logo, not guessed. The N's centre
                sits within 0.1px of the logo box's, so the row's items-center
                lines the rule up with the letter without a nudge. */}
            <span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-white/40" />
            <HeroStatus onOpen={onOpenOpeningstijden} />
          </div>

          <div className="relative">
            <button
              ref={desktopToggleRef}
              onClick={() => setDesktopMenuOpen((o) => !o)}
              aria-label={desktopMenuOpen ? "Menu sluiten" : "Menu openen"}
              aria-haspopup="true"
              aria-expanded={desktopMenuOpen}
              aria-controls="hero-desktop-menu"
              className={`nav-link light cursor-pointer relative z-[60] lg:!pr-0 lg:[&::after]:right-0 ${desktopMenuOpen ? "text-white! [&::after]:[transform:scaleX(0)]!" : ""}`}
            >
              <span className="flex flex-col items-end gap-[5px]">
                <HamburgerIcon open={desktopMenuOpen} colorClassName="bg-current" />
              </span>
              Menu
            </button>
            <DesktopMenu open={desktopMenuOpen} onClose={() => setDesktopMenuOpen(false)} triggerRef={desktopToggleRef} />
          </div>
        </m.div>

        {/* Mobile Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={delays ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.8, delay: d.header }}
          className="lg:hidden flex items-center justify-between"
        >
          <button
            onClick={scrollToTop}
            aria-label="Naar begin van de pagina"
            className={`inline-flex items-center ${TAP_TARGET} cursor-pointer active:scale-95 transition-transform duration-200 rounded-sm`}
          >
            <Logo className="h-[42px] w-auto" textColor="var(--color-hero-ink)" iconColor="var(--color-hero-ink)" iconOpacity={0.8} iconScale={34 / 42} textOffsetX={-10} />
          </button>
          <button
            onClick={onOpenMenu}
            aria-label={isMenuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            // items-end keeps the rules against the button's right edge, so the
            // extra width TAP_TARGET adds falls on the left and -mr-2 still
            // lines the icon up with the content column.
            className={`flex flex-col items-end gap-[5px] p-2 -mr-2 ${TAP_TARGET} cursor-pointer active:scale-90 transition-transform duration-200 rounded-sm`}
          >
            <HamburgerIcon colorClassName="bg-hero-ink" />
          </button>
        </m.div>

        <div className="flex-1 flex flex-col justify-end lg:absolute lg:inset-x-0 lg:bottom-10 2xl:bottom-20 lg:block">
          {/* At 2xl+: titles/CTAs get max-w-[1280px] back so they stay in position */}
          <div className="mb-14 lg:mb-0">
            <div className="translate-y-4 lg:translate-y-0">
              {/* w-fit sizes this wrapper to the title, so the subtitle below can
                  never run wider than it. The subtitle is w-0 min-w-full: width:0
                  keeps it out of the wrapper's intrinsic width (a percentage
                  min-width is ignored while that width is being resolved), then
                  min-width:100% stretches it back to the title's width.
                  On mobile the title has no forced break, so its max-content
                  exceeds the column and fit-content clamps to the full width —
                  same layout as before. */}
              <div className="w-fit">
                <m.h1
                  // Skip-link target. Not <main>: that starts at y=0 with the
                  // hero's own status and menu buttons first inside it, so
                  // jumping there skipped nothing and moved nothing. Landing on
                  // the heading puts the next Tab on "Plan je moment" and gives
                  // screen readers the title to announce.
                  id="hoofdinhoud"
                  tabIndex={-1}
                  variants={fadeUp}
                  initial="hidden"
                  animate={show}
                  custom={d.title}
                  // The clamp floors used to be 32px/40px, which pinned the
                  // title flat below 427px and pushed it onto three lines on a
                  // 375px phone. The fluid 7.5vw already tracks the width the
                  // title needs — "Een gouden gloed die blijft," is 11.6x the
                  // font size, against (viewport - 48px) of room — so lowering
                  // the floors lets it govern down to 320px and the line breaks
                  // on the comma instead. Only widths below 427px change.
                  className="font-display font-normal tracking-[-0.02em] lg:tracking-[-3px] text-[clamp(24px,7.5vw,88px)] leading-[clamp(30px,10vw,94px)] lg:text-[66px] lg:leading-[1.2] 2xl:text-[74px] 2xl:leading-[1.2] text-hero-ink"
                  style={{ marginLeft: "-3px" }}
                >
                  Een gouden gloed die blijft,{" "}<br className="hidden lg:inline" />
                  begint bij{" "}
                  <span className="relative inline-block">
                    Ever Sun
                    <HeroLines play={reviewsSettled} />
                  </span>
                </m.h1>

                <m.p
                  className="hidden lg:block w-0 min-w-full mt-2.5 md:mt-3 lg:mt-4 font-sans font-normal text-[15px] md:text-[20px] lg:text-[18px] 2xl:text-[24px] leading-[25px] md:leading-[30px] lg:leading-[30px] 2xl:leading-[40px] text-hero-ink/75"
                  variants={fadeUp}
                  initial="hidden"
                  animate={show}
                  custom={d.sub}
                >
                  In onze zonnestudio draait het gewoon om jou.
                  <br />
                  Twintig minuten voor jezelf, zonder dat er iets van je gevraagd wordt.
                </m.p>

                <m.p
                  className="lg:hidden block w-0 min-w-full mt-2 md:mt-3 font-sans font-normal text-[15px] md:text-[20px] leading-[24px] md:leading-[30px] text-hero-ink/75"
                  variants={fadeUp}
                  initial="hidden"
                  animate={show}
                  custom={d.sub}
                >
                  In onze zonnestudio draait het gewoon om jou. Twintig minuten voor jezelf, zonder dat er iets van je gevraagd wordt.
                </m.p>
              </div>

              {/* The row is one layout, two entrances: on desktop the reviews
                  arrive with the header and the buttons come in last with the
                  rest of the left column, so the fade cannot sit on the shared
                  parent. The wrapper below keeps the row's own geometry —
                  justify-between still measures the same two children. */}
              <div className="mt-6 md:mt-8 lg:mt-14 flex flex-row items-center justify-between w-full gap-6">
                <m.div
                  className="w-full sm:w-auto"
                  variants={fadeUp}
                  initial="hidden"
                  animate={show}
                  custom={d.buttons}
                >
                  <HeroButtons onOpenAfspraak={onOpenAfspraak} onOpenPlanJeMoment={onOpenPlanJeMoment} />
                </m.div>
                {/* hidden below lg like HeroReviews itself: an empty animating
                    wrapper would otherwise still take a turn in the flex row. */}
                <m.div
                  className="hidden lg:block"
                  variants={fadeUp}
                  initial="hidden"
                  animate={show}
                  custom={d.reviews}
                >
                  <HeroReviews onSettled={onReviewsSettled} />
                </m.div>
              </div>
            </div>
          </div>
        </div>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate={show}
          custom={d.status}
          className="mb-4 flex items-center justify-between lg:hidden"
        >
          <HeroStatus ref={statusButtonRef} onOpen={onOpenOpeningstijden} />
        </m.div>
      </div>
    </div>
  );
}
