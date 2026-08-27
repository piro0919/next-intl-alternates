import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* The heading face. Packages sharing one face are hard to tell apart. */
const display = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700"],
});

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  applicationName: "next-intl-alternates",
  description:
    "Canonical and hreflang metadata for a next-intl site: the default locale without its prefix, no redirecting URLs, and only the languages a page actually exists in.",
  formatDetection: { telephone: false },
  metadataBase: new URL("https://next-intl-alternates.kkweb.io"),
  title: "next-intl-alternates - hreflang That Survives Review",
};

export const viewport: Viewport = {
  themeColor: "#0a0d16",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
