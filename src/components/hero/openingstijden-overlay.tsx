"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, animate, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { getStudioStatus } from "@/lib/studio-status";
import { HOURS, getCurrentDayIndex } from "@/components/hero/hours-data";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CloseButton } from "@/components/ui/close-button";
import { Backdrop } from "@/components/ui/backdrop";
import { useHoverBlob } from "@/components/ui/hover-blob";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { BTN_FILL_LABEL, BTN_OUTLINE_BORDER } from "@/lib/button-styles";
import { BEHIND_SCALE, BEHIND_LIFT, DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";
import { ADDRESS, PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";

/**
 * Opens the "Plan je moment" sheet on top of this one when the caller passes a
 * handler. Without one it stays what it was, a direct WhatsApp link, so the
 * overlay keeps working wherever nothing is stacked on top of it.
 */
function AppointmentButton({ onPlanJeMoment }: { onPlanJeMoment?: () => void }) {
  const blob = useHoverBlob();

  // `relative overflow-hidden` so the fill is clipped to the pill. Both shapes
  // below share this string, which is the point: whichever one this renders,
  // it has to be the same button.
  const className =
    "group/cta relative overflow-hidden mt-7 flex w-full items-center justify-center bg-brand font-sans font-medium text-[15px] text-ink-primary active:scale-[0.98]";
  const style = {
    minHeight: "48px",
    borderRadius: "9999px",
    transition: "transform 0.2s ease, background-color 0.2s ease, color 0.2s ease",
  } as const;

  const content = (
    <>
      {blob.blob}
      <span className={`${BTN_FILL_LABEL} group-hover/cta:text-surface-page`}>Plan je moment</span>
    </>
  );

  if (!onPlanJeMoment) {
    return (
      <a
        href={WHATSAPP_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        {...blob.hoverProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onPlanJeMoment}
      className={`${className} cursor-pointer`}
      style={style}
      {...blob.hoverProps}
    >
      {content}
    </button>
  );
}

function AddressInfo() {
  return (
    <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-[6px]">
      {ADDRESS.street}, {ADDRESS.city} · <a href={`tel:${PHONE_E164}`} className="text-zinc-600 underline decoration-dotted underline-offset-6 md:no-underline">{PHONE_DISPLAY}</a>
    </p>
  );
}

function HoursTable() {
  const todayIndex = getCurrentDayIndex();
  const { isOpen } = getStudioStatus();

  return (
    <div>
      {HOURS.map(({ day, hours }, i) => {
        const isToday = i === todayIndex;
        return (
          <div
            key={day}
            className={`grid grid-cols-2 py-3 ${i < HOURS.length - 1 ? "border-b border-surface-page" : ""}`}
          >
            <span className={`font-sans text-[15px] text-zinc-600 leading-[1.4] ${isToday ? "font-semibold" : "font-normal"}`}>{day}</span>
            <div className="flex items-center gap-4">
              <p className={`font-sans text-[15px] text-zinc-600 leading-[1.4] ${isToday ? "font-semibold" : "font-medium"}`}>{hours}</p>
              {isToday && (
                <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
                  {isOpen ? (
                    <>
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-status-open opacity-60 animate-ping" />
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-status-open opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
                      <span className="absolute inline-flex w-[10px] h-[10px] rounded-full bg-status-open" />
                    </>
                  ) : (
                    <span className="absolute inline-flex w-[10px] h-[10px] rounded-full bg-accent" />
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The edge comes from BTN_OUTLINE_BORDER, like every other outline button. That
// also retires the hover state this button used to keep in React: a JS hover
// sticks when the tab loses focus — which this link does on every click, it
// opens Maps in a new tab — so it needed a window blur listener to let go
// again. Tailwind's hover variant is already behind `(hover: hover)`, so the
// touch case that the matchMedia guard was for is covered too.
function RouteButton() {
  return (
    <a
      href="https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w"
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-3 md:mt-7 flex w-full md:w-fit items-center justify-center py-3 font-sans font-medium text-[15px] text-zinc-600 rounded-full ${BTN_OUTLINE_BORDER} px-8 active:scale-[0.98] transition-[transform,border-color] duration-200`}
      style={{ minHeight: "48px" }}
    >
      Route naar Ever Sun
    </a>
  );
}

export default function OpeningstijdenOverlay({
  isOpen,
  onClose,
  onPlanJeMoment,
  isBehind = false,
  panelRef,
  stackDepth,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Opens the "Plan je moment" sheet over this one instead of WhatsApp. */
  onPlanJeMoment?: () => void;
  /** True while another sheet covers this one. */
  isBehind?: boolean;
  /** The mobile sheet itself, so a sheet stacking on top can size against it. */
  panelRef?: RefObject<HTMLDivElement | null>;
  /**
   * How deep in the stack this sheet sits: 1 fully behind, 0 at its own size.
   * Driven by the drag of the sheet in front, so pulling that one down hands
   * this one its size back a bit at a time instead of at the moment it closes.
   */
  stackDepth?: MotionValue<number>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Without a caller driving the depth there is no drag to follow, so it falls
  // back to the plain in/out on `isBehind` — the sheet works the same wherever
  // nothing stacks on it.
  const shouldReduceMotion = useReducedMotion();
  const ownDepth = useMotionValue(0);
  const depth = stackDepth ?? ownDepth;
  const behindY = useTransform(depth, [0, 1], [0, BEHIND_LIFT]);
  const behindScale = useTransform(depth, [0, 1], [1, BEHIND_SCALE]);

  useEffect(() => {
    if (stackDepth) return;
    const sunk = isBehind ? 1 : 0;
    // A hand-written value, so `MotionConfig reducedMotion` never sees it. The
    // sheet still sinks — that is where it belongs while another covers it —
    // it just does not travel there.
    if (shouldReduceMotion) {
      ownDepth.set(sunk);
      return;
    }
    const controls = animate(ownDepth, sunk, STACK_SPRING);
    return () => controls.stop();
  }, [stackDepth, ownDepth, isBehind, shouldReduceMotion]);

  // The trap is handed to the sheet on top: two traps on the same window would
  // both answer Escape, closing this one along with it, and fight over Tab.
  useFocusTrap(overlayRef, isOpen && !isBehind, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || isBehind) return;
    overlayRef.current?.focus({ preventScroll: true });
  }, [isOpen, isBehind]);

  if (!mounted) return null;

  // Portalled to <body>, like plan-je-moment-sheet: rendered inline it sits
  // inside <main>, which has its own z-index and so its own stacking context —
  // no z-index in here could then ever clear the sticky header, which sits
  // outside <main> at the root. z-[55] is still below plan-je-moment-sheet's
  // z-[60], so that one stacks above this when the two are open together.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} className="z-[55]" scrollLock />

          <div ref={overlayRef} tabIndex={-1} className="outline-none" inert={isBehind}>
          {/* Mobile: Bottom Sheet.
              Two elements, because two transforms have to live side by side:
              the outer one sinks the sheet back into the stack, the inner one
              slides it in, out and under the finger. On one element the drag
              would fight the sink, and framer would drop whichever wrote last. */}
          <m.div
            // Sinks back when a sheet stacks on top: scaled from its bottom
            // edge, so it stays anchored to the screen edge and only its
            // shoulders show behind the sheet in front.
            className="md:hidden fixed bottom-0 inset-x-0 z-[55]"
            style={{ y: behindY, scale: behindScale, transformOrigin: "bottom center" }}
          >
            <m.div
              ref={panelRef}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Openingstijden"
              className="bg-surface-page rounded-t-[20px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={STACK_SPRING}
              drag="y"
              // No dragging what you cannot reach: the sheet in front owns the
              // gesture while it is open.
              dragListener={!isBehind}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex justify-center pt-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="px-6 pt-5">
                <div className="mb-[22px]">
                  <h2 className="card-title text-zinc-900">Openingstijden</h2>
                  <AddressInfo />
                </div>
                <div className="bg-white rounded-2xl px-6 py-4">
                  <HoursTable />
                </div>
                <AppointmentButton onPlanJeMoment={onPlanJeMoment} />
                <RouteButton />
              </div>
            </m.div>
          </m.div>

          {/* Desktop: Modal */}
          <m.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Openingstijden"
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-page rounded-2xl z-[55] w-[400px]"
            initial={{ opacity: 0, scale: 0.88, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative p-8">
              <CloseButton onClick={onClose} className="absolute top-4 right-4" />
              <div className="mb-[22px]">
                <h2 className="card-title text-zinc-900">Openingstijden</h2>
                <AddressInfo />
              </div>
              <div className="bg-white rounded-2xl px-6 py-4">
                <HoursTable />
              </div>
              <RouteButton />
            </div>
          </m.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
