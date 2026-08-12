import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { QR_TARGETS, renderQrSvg } from "./qr-svg";
import { WHATSAPP_BOOKING_URL, ZONNEBANK_SLUGS, zonnebankBookingUrl } from "./whatsapp";

describe("QR targets", () => {
  it("covers the generic link plus every zonnebank", () => {
    expect(QR_TARGETS).toHaveLength(ZONNEBANK_SLUGS.length + 1);
    expect(QR_TARGETS.map((t) => t.url)).toEqual([
      WHATSAPP_BOOKING_URL,
      ...ZONNEBANK_SLUGS.map(zonnebankBookingUrl),
    ]);
  });

  it("gives every code its own file and its own URL", () => {
    expect(new Set(QR_TARGETS.map((t) => t.file)).size).toBe(QR_TARGETS.length);
    // Two banks sharing a URL would silently ship two identical codes, which
    // defeats the entire point of a per-bank code.
    expect(new Set(QR_TARGETS.map((t) => t.url)).size).toBe(QR_TARGETS.length);
  });
});

describe("committed QR assets", () => {
  // The drift guard: the codes on disk are generated output, and generated
  // output goes stale the first time someone edits a booking message and
  // forgets `npm run qr:generate`. Regenerating here means the test suite
  // notices instead of a visitor with a phone.
  it.each(QR_TARGETS)("$file still encodes its URL", ({ file, url }) => {
    expect(existsSync(file), `${file} is missing — run \`npm run qr:generate\``).toBe(true);
    expect(
      readFileSync(file, "utf8"),
      `${file} is stale — run \`npm run qr:generate\``
    ).toBe(renderQrSvg(url));
  });
});

describe("renderQrSvg", () => {
  it("encodes the URL rather than embedding it as text", () => {
    const svg = renderQrSvg(WHATSAPP_BOOKING_URL);
    expect(svg).toMatch(/^<svg /);
    expect(svg).not.toContain("wa.me");
  });

  it("produces a different pattern for a different message", () => {
    expect(renderQrSvg(zonnebankBookingUrl("ergoline-600-light"))).not.toBe(
      renderQrSvg(zonnebankBookingUrl("ergoline-blue-vision"))
    );
  });

  it("is deterministic, so regenerating never churns the diff", () => {
    expect(renderQrSvg(WHATSAPP_BOOKING_URL)).toBe(renderQrSvg(WHATSAPP_BOOKING_URL));
  });
});
