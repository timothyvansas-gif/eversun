"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import reviewer1 from "@/images/people/reviewer-1.webp";
import reviewer2 from "@/images/people/reviewer-2.webp";
import reviewer3 from "@/images/people/reviewer-3.webp";

export default function HeroReviews() {
  const reviewers = [reviewer1, reviewer2, reviewer3];

  return (
    <div className="hidden lg:flex items-center gap-3">
      {/* Photo stack */}
      <div className="flex -space-x-3">
        {reviewers.map((img, i) => (
          <div
            key={i}
            className="w-[40px] h-[40px] rounded-full border border-[#111111] overflow-hidden relative"
            style={{ zIndex: i }}
          >
            <Image
              src={img}
              alt={`Reviewer ${i + 1}`}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Text Container */}
      <div 
        className="h-[40px] px-5 flex items-center bg-[#111111]/40 backdrop-blur-[2px] rounded-full"
      >
        <span className="font-sans text-[15px] leading-none whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
          <span className="font-bold">4.9</span>/5 <span className="opacity-50">-</span> 176 reviews
        </span>
      </div>
    </div>
  );
}
