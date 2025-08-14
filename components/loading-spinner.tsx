"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-500", sizeClasses[size])} />
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded", className)} />
}

export function GameLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto animate-bounce-in">
          <div className="w-full h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white animate-wiggle" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white animate-fade-in">Loading Game...</h2>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
