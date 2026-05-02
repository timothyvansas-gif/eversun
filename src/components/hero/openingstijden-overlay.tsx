"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { getStudioStatus } from "@/components/hero/hero-status";
import { HOURS, getCurrentDayIndex } from "@/components/hero/hours-data";

const SHADOW_DEFAULT =
  "0 -2px 0 0 #D45110 inset, 0 0 0 1px rgba(255, 255, 255, 0.16) inset, 0 0 0 1px #B53B02, -93px 101px 38px 0 rgba(46, 14, 0, 0.00), -59px 64px 35px 0 rgba(46, 14, 0, 0.04), -33px 36px 30px 0 rgba(46, 14, 0, 0.12), -15px 16px 22px 0 rgba(46, 14, 0, 0.21), -4px 4px 12px 0 rgba(46, 14, 0, 0.24)";
const SHADOW_HOVER =
  "0 -3px 0 0 rgba(0, 0, 0, 0.40) inset, 0 1px 0 1px rgba(255, 255, 255, 0.11) inset, 0 0 0 1px #000, -93px 101px 38px 0 rgba(46, 14, 0, 0.00), -59px 64px 35px 0 rgba(46, 14, 0, 0.04), -33px 36px 30px 0 rgba(46, 14, 0, 0.12), -15px 16px 22px 0 rgba(46, 14, 0, 0.21), -4px 4px 12px 0 rgba(46, 14, 0, 0.24)";
const SHADOW_EASE = "0.4s cubic-bezier(0.22, 1, 0.36, 1)";
const BLOB_SIZE = 460;

function AppointmentButton() {
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <a
      href="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-7 flex w-full items-center justify-center font-sans font-medium text-[15px] text-[#FAF4EC] active:scale-[0.98] relative overflow-hidden"
      style={{
        minHeight: "48px",
        borderRadius: "16px",
        background: "#E15E1D",
        transition: `box-shadow ${SHADOW_EASE}, transform 0.2s ease`,
        boxShadow: hovered ? SHADOW_HOVER : SHADOW_DEFAULT,
      }}
      onMouseEnter={(e) => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
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
      <span className="relative z-10">Maak een afspraak</span>
    </a>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AddressInfo() {
  return (
    <p className="font-sans text-[15px] text-[#1a1a1a]/80 leading-[24px] mt-2.5">
      Kloekhorststraat 4a, Assen, 9401 BD
      <br />
      <a href="tel:+31625306491" className="text-[#1a1a1a]/80">
        06 25306491
      </a>
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
            className={`grid grid-cols-[110px_1fr] gap-x-3 py-3 ${i < HOURS.length - 1 ? "border-b border-[#FAF4EC]" : ""}`}
          >
            <span className="font-sans font-normal text-[15px] text-[#1a1a1a] leading-[1.4]">{day}</span>
            <div className="flex items-center gap-4">
              <p className="font-sans font-medium text-[15px] text-[#1a1a1a] leading-[1.4]">{hours}</p>
              {isToday && (
                <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
                  {isOpen ? (
                    <>
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-[#4FA800] opacity-60 animate-ping" />
                      <span className="absolute inline-flex w-[14px] h-[14px] rounded-full bg-[#4FA800] opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
                      <span className="absolute inline-flex w-[10px] h-[10px] rounded-full bg-[#4FA800]" />
                    </>
                  ) : (
                    <span className="absolute inline-flex w-[10px] h-[10px] rounded-full bg-[#E15E1D]" />
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
      className="mt-3 md:mt-7 flex w-full md:w-fit items-center justify-center py-3 font-sans font-medium text-[15px] text-[#1a1a1a] rounded-2xl border px-8 active:scale-[0.98] transition-[transform,border-color] duration-200 focus:outline-none"
      style={{ minHeight: "48px", borderColor: hovered ? "#1F1F1E" : "rgba(26,26,26,0.2)" }}
      onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      Route naar Ever Sun
    </a>
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
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-center pt-3 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-[#1a1a1a]/20" />
            </div>
            <div className="px-6 pt-5">
              <div className="mb-5">
                <h2 className="card-title text-zinc-900">Openingstijden</h2>
                <AddressInfo />
              </div>
              <div className="bg-white rounded-2xl px-6 py-4">
                <HoursTable />
              </div>
              <AppointmentButton />
              <RouteButton />
            </div>
          </motion.div>

          {/* Desktop: Modal */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF4EC] rounded-2xl z-40 w-[400px]"
            initial={{ opacity: 0, scale: 0.88, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-[6px] text-[#1a1a1a]/80 md:hover:bg-[#ffffff] md:hover:text-[#000000] transition-colors cursor-pointer"
              >
                <CloseIcon />
              </button>
              <div className="mb-5">
                <h2 className="card-title text-zinc-900">Openingstijden</h2>
                <AddressInfo />
              </div>
              <div className="bg-white rounded-2xl px-6 py-4">
                <HoursTable />
              </div>
              <RouteButton />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
