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
        {/* Standalone (home-screen) mode only. `black-translucent` above puts the
            status bar over the page there, and the inset is reported, so this
            fills it. In a browser tab the inset is 0px — no `viewport-fit=cover`,
            by the decision above — and Safari tints the bar with `theme-color`
            instead, so this collapses to nothing and is not what keeps the bar
            dark. It was mistaken for that for a long time; it never had height
            on the phone. */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "env(safe-area-inset-top)",
            background: "var(--color-void)",
            zIndex: 9999,
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
        {/* Tijdelijk, alleen op ?debug=safearea. */}
        <SafeAreaDebug />
      </body>
    </html>
  );
}
