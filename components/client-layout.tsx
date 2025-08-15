"use client"

import type React from "react"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/components/notification-toast"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { ToastContainer } = useToast()

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <ToastContainer />
    </>
  )
}
