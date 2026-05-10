"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image, { StaticImageData } from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  photos: StaticImageData[];
}

export default function PhotoLightbox({ isOpen, onClose, photos }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] hidden md:flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.9)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-[900px] px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-11 right-[18px] text-white text-[28px] leading-none opacity-80 hover:opacity-100 transition-opacity duration-150 px-2 py-1 cursor-pointer"
              onClick={onClose}
              aria-label="Sluiten"
            >
              ×
            </button>

            <div
              className="relative w-full rounded-lg overflow-hidden"
              style={{ aspectRatio: "1456 / 816" }}
            >
              <AnimatePresence>
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.28, ease: "easeOut" },
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    transition: { duration: 0.22, ease: "easeIn" },
                  }}
                >
                  <Image
                    src={photos[activeIndex]}
                    alt={`Impressie Ever Sun zonnestudio ${activeIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="900px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Foto ${i + 1} bekijken`}
                  className={[
                    "relative w-20 h-[52px] rounded flex-shrink-0 overflow-hidden transition-opacity duration-150 cursor-pointer",
                    i === activeIndex
                      ? "opacity-100 outline outline-2 outline-white outline-offset-2"
                      : "opacity-[0.55] hover:opacity-[0.85]",
                  ].join(" ")}
                >
                  <Image
                    src={photo}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
