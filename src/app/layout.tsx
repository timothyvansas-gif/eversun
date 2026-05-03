import type { Metadata } from "next";
import { Inter, Alice } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const alice = Alice({
  weight: "400",
  variable: "--font-alice",
  subsets: ["latin"],
});

const BASE_URL = "https://www.eversun-assen.nl";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Ever Sun",
  url: BASE_URL,
  telephone: "+31625306491",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kloekhorststraat 4a",
    addressLocality: "Assen",
    postalCode: "9401 BD",
    addressCountry: "NL",
  },
  openingHours: ["Tu-Fr 10:00-21:00", "Sa-Su 10:00-16:00"],
  priceRange: "€€",
};

export const metadata: Metadata = {
  title: "Ever Sun | Zonnestudio Assen",
  description:
    "Zonnestudio Ever Sun in Assen — professionele zonnebanken Ergoline en top producten voor de perfecte bruining zoals Black Velvet. Kloekhorststraat 4a, open di t/m zo.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ever Sun | Zonnestudio Assen",
    description:
      "Professionele zonnestudio in Assen. Topmerken, deskundig advies en luxe cabines.",
    url: BASE_URL,
    siteName: "Ever Sun",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ever Sun | Zonnestudio Assen",
    description:
      "Professionele zonnestudio in Assen. Topmerken, deskundig advies en luxe cabines.",
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
  themeColor: "#000000",
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
      className={`${inter.variable} ${alice.variable} h-full antialiased`}
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
            height: "env(safe-area-inset-top)",
            background: "#000000",
            zIndex: 9999,
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
