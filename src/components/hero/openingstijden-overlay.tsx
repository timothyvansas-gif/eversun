"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { m, AnimatePresence } from "framer-motion";
import { getStudioStatus } from "@/lib/studio-status";
import { HOURS, getCurrentDayIndex } from "@/components/hero/hours-data";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CloseButton } from "@/components/ui/close-button";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { Backdrop } from "@/components/ui/backdrop";
import { BEHIND_SCALE, BEHIND_LIFT } from "@/components/hero/sheet-stack";

const WHATSAPP_URL =
  "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken";

/**
 * Opens the "Plan je moment" sheet on top of this one when the caller passes a
 * handler. Without one it stays what it was, a direct WhatsApp link, so the
 * overlay keeps working wherever nothing is stacked on top of it.
 */
function AppointmentButton({ onPlanJeMoment }: { onPlanJeMoment?: () => void }) {
  // The orange holds on hover, like every other accent button.
  const className =
    "group/cta mt-7 flex w-full items-center justify-center font-sans font-medium text-[15px] text-surface-page active:scale-[0.98] relative overflow-hidden";
  const style = {
    minHeight: "48px",
    borderRadius: "9999px",
    background: "var(--color-accent)",
    transition: "transform 0.2s ease",
  } as const;

  const content = (
    <>
      <span className="relative z-10">Plan je moment</span>
      <CtaArrow />
    </>
  );

  if (!onPlanJeMoment) {
    return (
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onPlanJeMoment} className={`${className} cursor-pointer`} style={style}>
      {content}
    </button>
  );
}

// text-muted rather than ink/60: that alpha blend measures 4.44:1 on the sheet
// surface, just under 1.4.3, and it carried the phone link with it. The token is
// the same role in the palette and clears at 4.99:1.
function AddressInfo() {
  return (
    <p className="font-sans text-[15px] text-muted leading-[24px] mt-[6px]">
      Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-muted underline decoration-dotted underline-offset-6 md:no-underline">06 25306491</a>
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
            <span className={`font-sans text-[15px] text-ink leading-[1.4] ${isToday ? "font-semibold" : "font-normal"}`}>{day}</span>
            <div className="flex items-center gap-4">
              <p className={`font-sans text-[15px] text-ink leading-[1.4] ${isToday ? "font-semibold" : "font-medium"}`}>{hours}</p>
              {isToday && (
                <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
                  {isOpen ? (
                    <>
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-[#4FA800] opacity-60 animate-ping" />
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-[#4FA800] opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
                      <span className="absolute inline-flex w-[10px] h-[10px] rounded-full bg-[#4FA800]" />
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

function RouteButton() {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const reset = () => setHovered(false);
    window.addEventListener("blur", reset);
    return () => window.removeEventListener("blur", reset);
  }, []);

  return (
    <a
      href="https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w"
      target="_blank"
      rel="noopener noreferrer"
      className="group/cta mt-3 md:mt-7 flex w-full md:w-fit items-center justify-center py-3 font-sans font-medium text-[15px] text-ink rounded-full border px-8 active:scale-[0.98] transition-[transform,border-color] duration-200"
      style={{ minHeight: "48px", borderColor: hovered ? "#1F1F1E" : "rgba(26,26,26,0.2)" }}
      onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      Route naar Ever Sun
      <CtaArrow />
    </a>
  );
}

export default function OpeningstijdenOverlay({
  isOpen,
  onClose,
  onPlanJeMoment,
  isBehind = false,
  panelRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Opens the "Plan je moment" sheet over this one instead of WhatsApp. */
  onPlanJeMoment?: () => void;
  /** True while another sheet covers this one. */
  isBehind?: boolean;
  /** The mobile sheet itself, so a sheet stacking on top can size against it. */
  panelRef?: RefObject<HTMLDivElement | null>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // The trap is handed to the sheet on top: two traps on the same window would
  // both answer Escape, closing this one along with it, and fight over Tab.
  useFocusTrap(overlayRef, isOpen && !isBehind, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || isBehind) return;
    overlayRef.current?.focus({ preventScroll: true });
  }, [isOpen, isBehind]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — dims hero content */}
          <Backdrop onClick={onClose} className="z-50" scrollLock />

          <div ref={overlayRef} tabIndex={-1} className="outline-none" inert={isBehind}>
          {/* Mobile: Bottom Sheet */}
          <m.div
            ref={panelRef}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Openingstijden"
            className="md:hidden fixed bottom-0 inset-x-0 bg-surface-page rounded-t-[20px] z-50"
            initial={{ y: "100%" }}
            // Sinks back when a sheet stacks on top: scaled from its bottom
            // edge, so it stays anchored to the screen edge and only its
            // shoulders show behind the sheet in front.
            animate={{ y: isBehind ? BEHIND_LIFT : 0, scale: isBehind ? BEHIND_SCALE : 1 }}
            exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 40, stiffness: 300 }}
            drag="y"
            // No dragging what you cannot reach: the sheet in front owns the
            // gesture while it is open.
            dragListener={!isBehind}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) onClose();
            }}
            style={{
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              transformOrigin: "bottom center",
            }}
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

          {/* Desktop: Modal */}
          <m.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Openingstijden"
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-page rounded-2xl z-50 w-[400px]"
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
    </AnimatePresence>
  );
}
