"use client";

import dynamic from "next/dynamic";

const SmoothScrollInit = dynamic(() => import("./smooth-scroll-init"), { ssr: false });

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScrollInit />
      {children}
    </>
  );
}
