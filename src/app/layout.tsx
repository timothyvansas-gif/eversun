import type { Metadata } from "next";
import { Inter, PT_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
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
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            // Tijdelijk een ondergrens: op live loopt de hero bij het laden
            // door tot achter de statusbalk, terwijl deze strook hem juist
            // moet vullen. Twee mogelijke oorzaken — de strook is nul hoog
            // omdat iOS de inset nog niet meldt, of de pagina schildert daar
            // helemaal niet en je ziet Safari's eigen strook. Met 47px erin
            // wijst zwart op het eerste en de foto op het tweede.
            height: "max(env(safe-area-inset-top), 47px)",
            background: "var(--color-void)",
            zIndex: 9999,
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
