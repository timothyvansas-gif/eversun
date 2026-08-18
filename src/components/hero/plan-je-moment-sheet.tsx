"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { m, AnimatePresence, animate, useMotionValue, type MotionValue } from "framer-motion";
import whatsappIcon from "@/images/whatsapp.svg";
import { getReviews } from "@/lib/reviews";
import StarIcon from "@/components/ui/star-icon";
import { useHoverBlob } from "@/components/ui/hover-blob";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Backdrop } from "@/components/ui/backdrop";
import { BTN_FILL_LABEL, BTN_OUTLINE_BORDER } from "@/lib/button-styles";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";
import { stackDepthForDrag, scrimOpacityForDrag, DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
      <path
        d="M13.12 5.00012C14.0967 5.19069 14.9944 5.66838 15.698 6.37206C16.4017 7.07574 16.8794 7.97339 17.07 8.95012M13.12 1.00012C15.1492 1.22556 17.0416 2.1343 18.4862 3.57713C19.9309 5.01996 20.842 6.91113 21.07 8.94012M9.29695 12.8632C8.09537 11.6616 7.14659 10.303 6.45059 8.85335C6.39072 8.72866 6.36079 8.66632 6.33779 8.58743C6.25607 8.30707 6.31477 7.96281 6.48478 7.72538C6.53262 7.65857 6.58978 7.60141 6.70409 7.4871C7.0537 7.1375 7.2285 6.96269 7.34278 6.78692C7.77378 6.12402 7.77378 5.26944 7.34279 4.60655C7.2285 4.43078 7.0537 4.25597 6.70409 3.90637L6.50922 3.7115C5.97778 3.18005 5.71206 2.91433 5.42668 2.76999C4.85912 2.48292 4.18885 2.48292 3.62129 2.76999C3.33591 2.91433 3.07019 3.18005 2.53874 3.7115L2.38111 3.86913C1.85149 4.39875 1.58668 4.66357 1.38443 5.0236C1.16001 5.4231 0.998645 6.0436 1.00001 6.50182C1.00124 6.91476 1.08134 7.19699 1.24155 7.76143C2.10252 10.7948 3.72699 13.6572 6.11497 16.0452C8.50295 18.4332 11.3653 20.0576 14.3987 20.9186C14.9632 21.0788 15.2454 21.1589 15.6583 21.1601C16.1165 21.1615 16.737 21.0001 17.1365 20.7757C17.4966 20.5735 17.7614 20.3087 18.291 19.779L18.4486 19.6214C18.9801 19.09 19.2458 18.8242 19.3902 18.5389C19.6772 17.9713 19.6772 17.301 19.3902 16.7335C19.2458 16.4481 18.9801 16.1824 18.4486 15.6509L18.2538 15.4561C17.9042 15.1064 17.7294 14.9316 17.5536 14.8174C16.8907 14.3864 16.0361 14.3864 15.3732 14.8174C15.1975 14.9316 15.0226 15.1064 14.673 15.4561C14.5587 15.5704 14.5016 15.6275 14.4348 15.6754C14.1973 15.8454 13.8531 15.9041 13.5727 15.8224C13.4938 15.7994 13.4315 15.7694 13.3068 15.7096C11.8572 15.0136 10.4985 14.0648 9.29695 12.8632Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppButton({ whatsappUrl }: { whatsappUrl: string }) {
  const blob = useHoverBlob();

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      {...blob.hoverProps}
      className="group/cta w-full bg-brand font-sans font-medium text-[15px] text-ink-primary active:scale-[0.98] relative overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        alignItems: "center",
        minHeight: "48px",
        borderRadius: "9999px",
        transition: "transform 0.2s ease, background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* Absolutely positioned, so it sits out of the subgrid's auto-placement
          and cannot claim a column of its own. */}
      {blob.blob}
      <span className={`${BTN_FILL_LABEL} col-start-2 flex items-center gap-3 group-hover/cta:text-surface-page`}>
        <span className="inline-flex w-[18px] h-[18px] items-center justify-center shrink-0">
          <Image src={whatsappIcon} alt="" width={18} height={18} className="w-[18px] h-[18px] brightness-0 transition-[filter] duration-200 delay-[220ms] group-hover/cta:invert group-hover/cta:delay-[50ms]" />
        </span>
        <span className="whitespace-nowrap">Via WhatsApp</span>
      </span>
    </a>
  );
}

// Same edge as every other outline button, from the one constant. The subgrid
// stays inline: it is what lines this icon up with the WhatsApp button above.
function PhoneButton() {
  return (
    <a
      href="tel:+31625306491"
      className={`w-full font-sans font-medium text-[15px] text-zinc-600 rounded-full ${BTN_OUTLINE_BORDER} active:scale-[0.98] transition-[transform,border-color] duration-200`}
      style={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        alignItems: "center",
        minHeight: "48px",
      }}
    >
      <span className="col-start-2 flex items-center gap-3">
        <span className="inline-flex w-[18px] h-[18px] items-center justify-center shrink-0">
          <PhoneIcon />
        </span>
        <span className="whitespace-nowrap">Via Telefoon</span>
      </span>
    </a>
  );
}

// The three short reviews. Long quotes are left to the hero's dock: here they
// would push the buttons out of reach and make the sheet a different height
// every time it opens.
const SHEET_REVIEWS = getReviews(["willeke", "celine", "jackelien"]);

// Where the rotation left off, remembered across visits.
const ROTATION_KEY = "eversun:sheet-review";

/**
 * The next review in line, not a random one: independent draws from three
 * options repeat about a third of the time, which reads as "it is broken"
 * rather than as chance. The first visit starts somewhere random, so two
 * people do not open the sheet on the same face.
 *
 * Storage can be unavailable (private mode, blocked cookies), in which case
 * this falls back to a random pick rather than failing.
 */
function nextReviewIndex(): number {
  try {
    const stored = window.localStorage.getItem(ROTATION_KEY);
    const previous = stored === null ? Number.NaN : Number.parseInt(stored, 10);
    if (!Number.isInteger(previous)) throw new Error("no rotation yet");
    return (previous + 1) % SHEET_REVIEWS.length;
  } catch {
    return Math.floor(Math.random() * SHEET_REVIEWS.length);
  }
}

function Review() {
  // Chosen once per mount, and the sheet's contents only mount while it is
  // open, so every opening moves the rotation on. Reading during render is safe
  // because the portal only renders after mount — the server never sees this,
  // so there is no markup to mismatch on hydration.
  const [index] = useState(nextReviewIndex);
  const review = SHEET_REVIEWS[index];

  // Written from an effect, not from the initialiser: React can call an
  // initialiser twice, and storing the index that is actually on screen keeps
  // that harmless.
  useEffect(() => {
    try {
      window.localStorage.setItem(ROTATION_KEY, String(index));
    } catch {
      // Storage unavailable; the next opening falls back to a random pick.
    }
  }, [index]);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Image
          src={review.avatar}
          alt={review.name}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={14} />
            ))}
          </div>
          {/* leading-none, so the line box hugs the capitals. The 7px is the
              5px that puts the gap between stars and name back where it was,
              plus 2px asked for on top. */}
          <p className="font-sans text-[14px] font-medium text-zinc-900 leading-none mt-[7px]">{review.name}</p>
        </div>
      </div>
      <p className="mt-3 font-sans text-[14px] text-zinc-600 leading-[22px]">{review.quote}</p>
    </div>
  );
}

export default function PlanJeMomentSheet({
  isOpen,
  onClose,
  whatsappUrl = WHATSAPP_BOOKING_URL,
  stackedMinHeight,
  stackDepth,
  title,
  description,
}: {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl?: string;
  /**
   * What this sheet is for, when it is opened from somewhere with its own
   * story — the huidtest closes on an advice, not on an invitation to drop by.
   * Both fall back to the general booking wording.
   */
  title?: string;
  description?: React.ReactNode;
  /**
   * How deep in the stack the sheet behind this one sits, written while this
   * sheet is dragged: pulling it down gives the sheet behind its size back on
   * the way, so the two read as one stack rather than as a lid over a panel.
   */
  stackDepth?: MotionValue<number>;
  /**
   * Floor height in pixels while this sheet stacks on another one, from
   * `stackedSheetHeight`. Content-sized, the sheet would leave most of the one
   * behind it in view and the two would read as competing panels. The card
   * keeps its usual distance from the top edge, so the extra height lands
   * below it and the sheet opens the same way it does on its own.
   */
  stackedMinHeight?: number;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // This sheet's own scrim, handed to the Backdrop so the drag can dim it. One
  // value with three writers that never overlap: the fade-in on open, the drag
  // while the sheet is up, the fade-out on close. Left alone — no sheet behind,
  // or reduced motion — it is the plain in-and-out it always was.
  const scrimOpacity = useMotionValue(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHeightRef = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useFocusTrap(overlayRef, isOpen, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    overlayRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* z-[60], not z-50: this sheet can open on top of the openingstijden
              sheet, and the stack order should not depend on which of the two
              happens to render later in the DOM. */}
          <Backdrop onClick={onClose} className="z-[60] md:hidden" scrollLock opacity={scrimOpacity} />

          <div ref={overlayRef} tabIndex={-1} className="outline-none md:hidden">
            <m.div
              ref={panelRef}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Plan je moment"
              className="fixed bottom-0 inset-x-0 bg-surface-page rounded-t-[20px] z-[60]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={STACK_SPRING}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
              // Measured once per drag, not per frame: reading a box mid-gesture
              // forces the layout the drag is busy writing.
              onDragStart={() => {
                dragHeightRef.current = panelRef.current?.offsetHeight ?? 0;
              }}
              onDrag={(_, info) => {
                if (!stackDepth) return;
                stackDepth.set(stackDepthForDrag(info.offset.y));
                // Two scrims at full strength are 94% black. This one thins out
                // as its own sheet leaves — leaving it up while the sheet behind
                // grows would light that sheet as if it were still covered.
                scrimOpacity.set(scrimOpacityForDrag(info.offset.y, dragHeightRef.current));
              }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) {
                  onClose();
                  return;
                }
                // Let go halfway and the sheet behind sinks back with this one,
                // on the same spring, rather than snapping back on release.
                if (!stackDepth) return;
                if (shouldReduceMotion) {
                  stackDepth.set(1);
                  scrimOpacity.set(1);
                  return;
                }
                animate(stackDepth, 1, STACK_SPRING);
                animate(scrimOpacity, 1, STACK_SPRING);
              }}
              style={{
                paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom) + 1.25rem))",
                // Capped at 90svh: on a short screen the sheet behind is taller
                // than the viewport already, and matching it would push this
                // one's own top off the screen along with its drag handle.
                minHeight: stackedMinHeight ? `min(${stackedMinHeight}px, 90svh)` : undefined,
              }}
            >
              <div className="flex justify-center pt-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="px-6 pt-8">
                <div className="bg-white rounded-2xl px-6 py-6">
                  <div className="mb-5">
                    <h2 className="card-title text-zinc-900">{title ?? "Plan je moment"}</h2>
                    <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-[6px]">
                      {description ?? (
                        <>
                          Toe aan een moment voor jezelf? Kom lekker langs aan de{" "}
                          <a
                            href="https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 underline decoration-dotted underline-offset-6"
                          >
                            Kloekhorststraat 4A in Assen
                          </a>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="grid gap-y-4" style={{ gridTemplateColumns: "1fr max-content 1fr" }}>
                    <WhatsAppButton whatsappUrl={whatsappUrl} />
                    <PhoneButton />
                  </div>

                  <div className="h-px bg-surface-page mt-8 mb-6" />

                  <Review />
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
