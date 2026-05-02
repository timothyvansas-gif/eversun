"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const HOURS = [
  { day: "Maandag", hours: "Gesloten", note: "Morgen open om 10:00" },
  { day: "Dinsdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Woensdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Donderdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Vrijdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Zaterdag", hours: "10:00 – 16:00", note: "na 16:00: Morgen open om 10:00" },
  { day: "Zondag", hours: "10:00 – 16:00", note: "na 16:00: Dinsdag open om 10:00" },
];

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AddressInfo() {
  return (
    <p className="font-sans text-[15px] text-[#1a1a1a]/50 leading-[24px] mt-2.5">
      Kloekhorststraat 4a, Assen, 9401 BD
      <br />
      <a href="tel:+31625306491" className="text-[#1a1a1a]/50">
        06 25306491
      </a>
    </p>
  );
}

function HoursTable() {
  const [routeHovered, setRouteHovered] = useState(false);

  return (
    <div>
      {HOURS.map(({ day, hours }, i) => (
        <div
          key={day}
          className={`grid grid-cols-[110px_1fr] gap-x-3 py-3 ${i < HOURS.length - 1 ? "border-b border-[#f6ecde]" : ""}`}
        >
          <span className="font-sans font-normal text-[15px] text-[#1a1a1a] leading-[1.4]">{day}</span>
          <div>
            <p className="font-sans font-medium text-[15px] text-[#1a1a1a] leading-[1.4]">{hours}</p>
          </div>
        </div>
      ))}
      <a
        href="https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 flex w-full md:w-fit items-center justify-center py-3 font-sans font-medium text-[15px] text-[#1a1a1a] rounded-2xl border px-8 active:scale-[0.98] transition-[transform,border-color] duration-200"
        style={{ minHeight: "48px", borderColor: routeHovered ? "#1F1F1E" : "rgba(26,26,26,0.2)" }}
        onMouseEnter={() => setRouteHovered(true)}
        onMouseLeave={() => setRouteHovered(false)}
      >
        Route naar Ever Sun
      </a>
    </div>
  );
}

export default function OpeningstijdenOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — dims hero content */}
          <motion.div
            className="absolute inset-0 z-30"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            className="md:hidden absolute bottom-0 inset-x-0 bg-[#FAF4EC] rounded-t-[20px] z-40"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 40, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => lenis?.stop()}
            onDragEnd={(_, info) => {
              lenis?.start();
              if (info.offset.y > 80 || info.velocity.y > 400) onClose();
            }}
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-center pt-3 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-[#1a1a1a]/20" />
            </div>
            <div className="px-6 pt-5">
              <div className="mb-5">
                <h2 className="card-title text-zinc-900">Openingstijden</h2>
                <AddressInfo />
              </div>
              <HoursTable />
              <a
                href="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center py-3 font-sans font-medium text-[15px] text-[#FAF4EC] rounded-2xl active:scale-[0.98] transition-transform duration-200"
                style={{ minHeight: "48px", background: "#E15E1D" }}
              >
                Maak een afspraak
              </a>
            </div>
          </motion.div>

          {/* Desktop: Modal */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF4EC] rounded-2xl z-40 w-[384px]"
            initial={{ opacity: 0, scale: 0.88, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                <CloseIcon />
              </button>
              <div className="mb-5">
                <h2 className="card-title text-zinc-900">Openingstijden</h2>
                <AddressInfo />
              </div>
              <HoursTable />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
