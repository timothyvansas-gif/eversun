"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import whatsappIcon from "@/images/whatsapp.svg";
import { BLOB_SIZE } from "@/components/hero/button-constants";
import { getReviews } from "@/lib/reviews";
import StarIcon from "@/components/ui/star-icon";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { Backdrop } from "@/components/ui/backdrop";

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
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full font-sans font-medium text-[15px] text-surface-page active:scale-[0.98] relative overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        alignItems: "center",
        minHeight: "48px",
        borderRadius: "9999px",
        background: "var(--color-accent)",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <m.span
        aria-hidden
        className="absolute rounded-full bg-[#111] pointer-events-none"
        style={{
          width: BLOB_SIZE,
          height: BLOB_SIZE,
          left: origin.x - BLOB_SIZE / 2,
          top: origin.y - BLOB_SIZE / 2,
        }}
        initial={false}
        animate={{ scale: hovered ? 1 : 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="relative z-10 col-start-2 flex items-center gap-3">
        <span className="inline-flex w-[18px] h-[18px] items-center justify-center shrink-0">
          <Image src={whatsappIcon} alt="" width={18} height={18} className="w-[18px] h-[18px] brightness-0 invert" />
        </span>
        <span className="whitespace-nowrap">Via WhatsApp</span>
      </span>
    </a>
  );
}

function PhoneButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="tel:+31625306491"
      className="w-full font-sans font-medium text-[15px] text-ink rounded-full border active:scale-[0.98] transition-[transform,border-color] duration-200"
      style={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        alignItems: "center",
        minHeight: "48px",
        borderColor: hovered ? "#1F1F1E" : "rgba(26,26,26,0.2)",
      }}
      onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
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
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <Image
          src={review.avatar}
          alt={review.name}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
        <div>
          {/* leading-none, so the line box hugs the capitals. On the default
              21px leading the dead space above the name has no counterpart
              under the stars, and the whole block reads ~2px below the centre
              of the photo even though the boxes line up exactly. The 5px puts
              the gap between name and stars back where it was. */}
          <p className="font-sans text-[14px] font-medium text-ink leading-none">{review.name}</p>
          <div className="flex gap-0.5 mt-[5px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={14} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 font-sans text-[14px] text-ink/60 leading-[22px]">{review.quote}</p>
    </div>
  );
}

const DEFAULT_WHATSAPP_URL =
  "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken";

export default function PlanJeMomentSheet({
  isOpen,
  onClose,
  whatsappUrl = DEFAULT_WHATSAPP_URL,
}: {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

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
          <Backdrop onClick={onClose} className="z-50 md:hidden" scrollLock />

          <div ref={overlayRef} tabIndex={-1} className="outline-none md:hidden">
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Plan je moment"
              className="fixed bottom-0 inset-x-0 bg-surface-page rounded-t-[20px] z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 40, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              style={{ paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom) + 1.25rem))" }}
            >
              <div className="flex justify-center pt-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="px-6 pt-8">
                <div className="bg-white rounded-2xl px-6 py-6">
                  <div className="mb-5">
                    <h2 className="card-title text-zinc-900">Plan je moment</h2>
                    <p className="font-sans text-[15px] text-ink/60 leading-[24px] mt-[6px]">
                      Toe aan een moment voor jezelf? Kom lekker langs aan de{" "}
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink/60 underline decoration-dotted"
                      >
                        Kloekhorststraat 4A in Assen
                      </a>
                    </p>
                  </div>

                  <div className="grid gap-y-4" style={{ gridTemplateColumns: "1fr max-content 1fr" }}>
                    <WhatsAppButton whatsappUrl={whatsappUrl} />
                    <PhoneButton />
                  </div>

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
