"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import ovalsErgo from "@/images/ovals-ergo.svg";
import ErgolineSignature from "@/components/ergoline-signature";

export default function LuxeCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.6 });

  return (
    <div ref={containerRef} className="relative w-full lg:w-[302px] h-[362px] bg-white rounded-lg pt-6 px-6 pb-13 lg:p-10 flex flex-col lg:shrink-0 overflow-hidden lg:overflow-visible">
      <h3 className="card-title text-zinc-900">Ultieme luxe</h3>
      <p className="card-body text-zinc-500 mt-1">
        Onder de nummer één <span className="lg:hidden">zonne</span>banken
      </p>

      <img
        src={ovalsErgo.src}
        width={221}
        height={221}
        alt="Abstracte Ergoline merk-vormen"
        className="absolute bottom-[40px] left-[61px] lg:left-1/2 lg:-translate-x-1/2 lg:bottom-[32px] pointer-events-none"
      />

      <ErgolineSignature isInView={isInView} />
    </div>
  );
}
