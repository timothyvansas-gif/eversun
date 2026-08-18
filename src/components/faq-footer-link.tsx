"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FaqOverlay = dynamic(() => import("@/components/faq-overlay"));

/**
 * A real link that behaves like a button.
 *
 * The `href` is the point. The questions live in a panel because that is how
 * the studio wants the page to read, and a panel's contents are not in the HTML
 * until something opens it — so on its own it would be invisible to search
 * engines and to the assistants people now ask "moet ik reserveren bij Ever
 * Sun". `/veelgestelde-vragen` is that same list as a plain page: the crawler
 * follows the href and reads it, the visitor never leaves the homepage.
 *
 * Which also means the modified clicks have to keep working — cmd-click, middle
 * click, "open in nieuw tabblad" — so only a plain left click is intercepted.
 */
export default function FaqFooterLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <a
        href="/veelgestelde-vragen"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          event.preventDefault();
          setIsOpen(true);
        }}
        className="font-sans text-sm font-medium text-zinc-500 underline decoration-zinc-300 decoration-1 underline-offset-6 transition-colors duration-150 hover:text-ink-strong hover:decoration-ink-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        FAQ
      </a>

      <FaqOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
