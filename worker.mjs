// Repairs the document mode of every HTML response before it leaves the edge.
//
// Next's own build output starts with `<!DOCTYPE html>`. What Cloudflare serves
// starts with a `<script noModule>` and only then the doctype — the adapter's
// doing, between build and response. A doctype that is not the first thing in
// the document does not count, so Safari and every other browser fall back to
// quirks mode (`document.compatMode === "BackCompat"`, measured live).
//
// That is not cosmetic. In quirks mode WebKit hands out no safe-area insets:
// `env(safe-area-inset-top)` reads 0px on the device with `viewport-fit=cover`
// and without it, where a notched iPhone should report ~59px. Which is why the
// dark strip behind the status bar in layout.tsx has been zero pixels tall ever
// since this deploy path landed, while it worked on the previous host. The box
// model differs here too, so this reaches well past that one strip.
//
// The fix is a prepend, not a rewrite: the parser ignores a second doctype
// further down, so the only thing that has to change is what the browser sees
// first. No buffering, no HTML parsing — the body streams through untouched and
// the cost is the fifteen bytes in front of it. Buffering the document instead
// (`await response.text()`) would have cost the whole of streaming SSR.
//
// Plain .mjs rather than .ts on purpose: this imports the generated worker out
// of .open-next/, which is gitignored and only exists after a build, so a
// project-wide `tsc --noEmit` on a clean checkout could not resolve it.

import worker from "./.open-next/worker.js";

// Durable Objects and anything the adapter adds later. `export *` deliberately
// leaves `default` alone — that is the one export we replace.
export * from "./.open-next/worker.js";

const DOCTYPE = new TextEncoder().encode("<!DOCTYPE html>");

/** Enough bytes to see a doctype through any leading whitespace or BOM. */
const PEEK = 64;

function withDoctype(body) {
  let firstChunk = true;

  return body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        if (firstChunk) {
          firstChunk = false;
          const head = new TextDecoder()
            .decode(chunk.slice(0, PEEK))
            .replace(/^﻿/, "")
            .trimStart()
            .toLowerCase();
          if (!head.startsWith("<!doctype")) controller.enqueue(DOCTYPE);
        }
        controller.enqueue(chunk);
      },
    }),
  );
}

const wrapped = {
  async fetch(request, env, ctx) {
    const response = await worker.fetch(request, env, ctx);

    const type = response.headers.get("content-type") ?? "";
    // Encoded bodies are opaque to a text transform, and a body-less response
    // (304, HEAD) has nothing to prepend to.
    if (
      !type.includes("text/html") ||
      response.headers.has("content-encoding") ||
      !response.body
    ) {
      return response;
    }

    const headers = new Headers(response.headers);
    // The body grows by the doctype, so any declared length is now a lie.
    // These responses stream and normally carry none; deleting it is the safe
    // move either way.
    headers.delete("content-length");

    return new Response(withDoctype(response.body), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default wrapped;
