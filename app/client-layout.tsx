"use client"

import type React from "react"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/components/notification-toast"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

// <CHANGE> Added client component wrapper for toast notifications
function ClientLayout({ children }: { children: React.ReactNode }) {
  const { ToastContainer } = useToast()

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
        <PageTransition>{children}</PageTransition>
        <ToastContainer />
      </body>
    </html>
  )
}

export default ClientLayout
