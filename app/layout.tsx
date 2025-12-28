import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hugmyyoungerselfai.com"
  ),
  title: "Time Hug – Hug My Younger Self.",
  description:
    "Time Hug is a simple, nostalgic photo app to reunite with your younger self. Turn two photos into one hug.",
  keywords: [
    "hug my younger self",
    "time hug",
    "nostalgic photo app",
    "photo merge",
    "hug younger self photo",
    "reunite with younger self",
    "childhood photo",
    "AI photo app"
  ],
  openGraph: {
    title: "Time Hug – Hug My Younger Self.",
    description:
      "Time Hug is a simple, nostalgic photo app to reunite with your younger self. Turn two photos into one hug.",
    type: "website",
    images: [
      {
        url: "/bear-app-icon-png.png",
        width: 1200,
        height: 630,
        alt: "Time Hug – Hug My Younger Self.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Hug – Hug My Younger Self.",
    description:
      "Time Hug is a simple, nostalgic photo app to reunite with your younger self. Turn two photos into one hug.",
    images: [
      {
        url: "/bear-app-icon.png",
        alt: "Time Hug – Hug My Younger Self.",
      },
    ],
  },
  icons: {
    icon: "/bear-app-icon-png.png",
    shortcut: "/bear-app-icon-png.png",
    apple: "/bear-app-icon-png.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
