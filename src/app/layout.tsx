import type { Metadata, Viewport } from "next";

import "@fontsource-variable/instrument-sans/wght.css";

import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
