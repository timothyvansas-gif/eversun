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

export const metadata: Metadata = {
  title: "Ever Sun",
  description: "Ever Sun — jouw zonnebank specialist",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ever Sun",
  },
  other: {
    "google": "notranslate",
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
