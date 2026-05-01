"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import ovalsErgo from "@/images/ovals-ergo.svg";
import ErgolineSignature from "@/components/ergoline-signature";

export default function LuxeCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.6 });

  return (
    <div ref={containerRef} className="relative w-full h-[362px] bg-white rounded-lg pb-[52px] xl:pb-[40px] flex flex-col overflow-hidden xl:overflow-visible" style={{ paddingTop: 'clamp(24px, 4vw, 40px)', paddingLeft: 'clamp(24px, 4vw, 40px)', paddingRight: 'clamp(24px, 4vw, 40px)' }}>
      <h3 className="card-title text-zinc-900">Ultieme luxe</h3>
      <p className="card-body text-zinc-500 mt-1">
        Onder de nummer één <span className="xl:hidden">zonne</span>banken
      </p>

      <img
        src={ovalsErgo.src}
        width={221}
        height={221}
        alt="Abstracte Ergoline merk-vormen"
        className="absolute bottom-[40px] left-[61px] sm:left-1/2 sm:-translate-x-1/2 xl:bottom-[32px] pointer-events-none"
      />

      <ErgolineSignature isInView={isInView} />
    </div>
  );
}
