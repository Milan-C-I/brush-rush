import type React from "react";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "../components/client-layout";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Brush Rush - Multiplayer Drawing Game",
  description:
    "Join friends and draw together in real-time. Guess words, earn points, and become the ultimate artist!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-sans: ${dmSans.variable};
}
        `}</style>
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
