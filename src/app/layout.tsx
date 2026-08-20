import type { Metadata } from "next";
import { Inter, PT_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import SafeAreaDebug from "@/components/safe-area-debug";
import { SOCIAL_IMAGE, TWITTER_IMAGE } from "@/lib/social-metadata";
import { buildSiteJsonLd } from "@/lib/structured-data";
import { BASE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// The display face. It used to be loaded under the variable `--font-alice`,
// after a font the project no longer uses — three names (alice, display,
// PT_Serif) for one typeface, and DESIGN.md documented a fourth that was never
// here. Named for what it is; `--font-display` in globals.css is the semantic
// alias components should reach for.
const ptSerif = PT_Serif({
  weight: "400",
  variable: "--font-serif",
  subsets: ["latin"],
});

// The studio, its hours, its prices and the FAQ, as one schema.org graph built
// from the same data the page renders. See `@/lib/structured-data`.
const jsonLd = buildSiteJsonLd();

export const metadata: Metadata = {
  title: "Ever Sun | Zonnebank & Zonnestudio Assen",
  description:
    "Ergoline zonnebanken in Assen, vanaf €12 per sessie van 20 min. Persoonlijk huidadvies, parkeren voor de deur en doordeweeks open tot 21.00 uur.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ever Sun | Zonnebank & Zonnestudio Assen",
    description:
      "Ergoline zonnebanken, persoonlijk huidadvies en een sessie die om jou draait. Kloekhorststraat 4a, Assen.",
    url: BASE_URL,
    siteName: "Ever Sun",
    locale: "nl_NL",
    type: "website",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ever Sun | Zonnebank & Zonnestudio Assen",
    description:
      "Ergoline zonnebanken, persoonlijk huidadvies en een sessie die om jou draait. Kloekhorststraat 4a, Assen.",
    images: [TWITTER_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ever Sun",
  },
  other: {
    google: "notranslate",
    "format-detection": "telephone=no, date=no, address=no, email=no",
  },
};

// `viewportFit: "cover"` is what makes `env(safe-area-inset-top)` report a real
// number, and the strip below is sized on it. The two only work as a pair.
//
// Cover was briefly removed on the grounds that it measured 0px with and
// without — but that measurement was taken while the site was still served in
// quirks mode, where WebKit hands out no insets at all, so it could not have
// told the two apart. Do not repeat that test without checking
// `document.compatMode` first.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      translate="no"
      className={`${inter.variable} ${ptSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans relative" suppressHydrationWarning>
        {/* The band that keeps the iOS status bar dark, and it hangs entirely
            ABOVE the origin every fixed element shares.

            That origin is not the top of the screen. Measured on the device:
            `innerHeight` 735 against `documentElement.clientHeight` 695, and a
            `position: fixed` element at `top: 0` sits at the 695-box's top edge
            — 40px down. The strip Safari hands to the page, and draws the page
            into, is the 40px above that. Everything aimed at this for months
            was pinned at `top: 0`, which is already below the problem, which is
            why none of it ever covered anything.

            `env(safe-area-inset-top)` cannot size this: it measures 0px on the
            device in every state — quirks mode and standards mode, with
            `viewport-fit=cover` and without. All four combinations were tried.

            Sitting above the origin is what makes a fixed height safe. When
            Safari has not opened that overhang the whole band is off-screen and
            paints nothing; it can never cover page content, only the strip
            Safari would otherwise show the page through. So the height only has
            to be generous enough to cover the tallest overhang. */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: -96,
            left: 0,
            right: 0,
            height: 96,
            background: "var(--color-void)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
        {/* Tijdelijk, alleen op ?debug=safearea. */}
        <SafeAreaDebug />
      </body>
    </html>
  );
}
