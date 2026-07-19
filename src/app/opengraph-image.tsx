import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Share-card (og:image / twitter:image), 1200×630. Rendered server-side by
 * Next from this file convention — WhatsApp, iMessage, Slack, etc. show this
 * instead of scraping a random page image.
 */

export const alt = "Ever Sun — Zonnestudio Assen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The brand serif used on the site. Satori needs TTF (not woff2), so request
// Google Fonts with a legacy UA. Falls back to the default font on failure.
async function loadAliceFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Alice&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  // The wordmark paths are #111111 (designed for light backgrounds) — recolor
  // to cream for the dark card. Source file stays untouched.
  const logoSvg = readFileSync(
    join(process.cwd(), "src/images/logo-eversun.svg"),
    "utf8",
  ).replaceAll('fill="#111111"', 'fill="#FAF4EC"');
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
  const alice = await loadAliceFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #171310 100%)",
          gap: 36,
        }}
      >
        <img src={logoDataUri} alt="" width={444} height={120} />

        <div
          style={{
            width: 72,
            height: 1,
            background: "#C49764",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 44,
              color: "#FAF4EC",
              letterSpacing: "-0.01em",
            }}
          >
            Een gouden gloed die blijft
          </div>
          <div
            style={{
              fontSize: 27,
              color: "#C49764",
              letterSpacing: "0.02em",
            }}
          >
            Zonnestudio Assen · 06 25 30 64 91
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: alice
        ? [{ name: "Alice", data: alice, style: "normal" as const, weight: 400 as const }]
        : undefined,
    },
  );
}
