import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { preferenceCatalogue } from "@/data/sounds";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";

import "./globals.css";

const instrumentSans = localFont({
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  preload: true,
  src: "../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  variable: "--font-instrument-sans",
  weight: "400 700",
});

export const metadata: Metadata = {
  applicationName: "ATMOS",
  title: {
    default: "ATMOS",
    template: "%s — ATMOS",
  },
  description: "Immersive atmospheres for quieter moments.",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    description: "Immersive atmospheres for quieter moments.",
    locale: "en_US",
    siteName: "ATMOS",
    title: "ATMOS",
    type: "website",
  },
  robots: {
    follow: true,
    index: true,
  },
  twitter: {
    card: "summary",
    description: "Immersive atmospheres for quieter moments.",
    title: "ATMOS",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0d141c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={instrumentSans.variable}>
        <PreferencesProvider catalogue={preferenceCatalogue}>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
