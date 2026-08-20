"use client";

import { useEffect, useState } from "react";

/**
 * Temporary. Reads out, on the device itself, the numbers that decide whether
 * the dark strip in layout.tsx has any height. A notch and collapsing Safari
 * bars cannot be emulated and this Mac has no full Xcode, so no simulator —
 * the phone is the only instrument.
 *
 * Only mounts on `?debug=safearea`, so a visitor never meets it. That gate is
 * also what drives the render: without it the effect returns before writing a
 * single line, and an empty readout renders nothing.
 *
 * `inset-top` is the number that matters. It should now read ~59px rather than
 * 0px: `viewport-fit=cover` is back, and the site is out of quirks mode, where
 * WebKit handed out no insets at all. `compat` is printed alongside precisely
 * so that reading is never again taken at face value without it.
 */
export default function SafeAreaDebug() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "safearea") return;

    // A probe rather than reading the strip's own style: this resolves env()
    // through the engine, so we see the number the browser computed.
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top);pointer-events:none;opacity:0";
    document.body.appendChild(probe);

    const read = () => {
      const vv = window.visualViewport;
      const strip = document.querySelector<HTMLElement>(
        'body > div[aria-hidden="true"][style*="9999"]',
      );
      const r = strip?.getBoundingClientRect();
      const round = (n: number | undefined) => (n === undefined ? "?" : Math.round(n));

      setLines([
        `inset-top    ${getComputedStyle(probe).height}`,
        `strip        top ${round(r?.top)}  h ${round(r?.height)}`,
        `innerH ${window.innerHeight}  vvH ${round(vv?.height)}`,
        `scrollY ${Math.round(window.scrollY)}  compat ${document.compatMode}`,
        `lock ${document.documentElement.style.overflow || "-"}  docH ${document.documentElement.clientHeight}`,
      ]);
    };

    // Next frame rather than straight away: the first paint is where Safari is
    // still settling its bars, and reading there reports numbers that are stale
    // a frame later.
    const first = requestAnimationFrame(read);
    // The scroll lock is an imperative style write on <html> and fires no event,
    // and Safari resizes a beat after. A slow poll catches that transition.
    const poll = setInterval(read, 250);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(poll);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
      probe.remove();
    };
  }, []);

  if (lines.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        // Mid-screen on purpose: the edges are exactly what is in dispute here.
        top: "45%",
        left: 8,
        zIndex: 10000,
        background: "rgba(0,0,0,0.85)",
        color: "#4fa800",
        font: "11px/1.45 ui-monospace, Menlo, monospace",
        padding: "8px 10px",
        borderRadius: 6,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {lines.join("\n")}
    </div>
  );
}
