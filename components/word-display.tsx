"use client"

import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"

interface WordDisplayProps {
  word: string
  revealedLetters: boolean[]
  isDrawer: boolean
}

export function WordDisplay({ word, revealedLetters, isDrawer }: WordDisplayProps) {
  const displayWord = (word: string, revealed: boolean[]) => {
    return word
      .split("")
      .map((letter, index) => {
        if (letter === " ") return " "
        if (revealed[index] || isDrawer) return letter
        return "_"
      })
      .join("")
  }

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        {isDrawer ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-300">{isDrawer ? "Your Word" : "Guess the Word"}</span>
      </div>

      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-white tracking-wider mb-2">
          {displayWord(word, revealedLetters)}
        </div>
        <div className="text-xs text-gray-400">
          {word.length} letter{word.length !== 1 ? "s" : ""}
        </div>
      </div>

      {isDrawer && (
        <Badge variant="secondary" className="mt-3 bg-green-500/20 text-green-400">
          You are drawing
        </Badge>
      )}
    </div>
  )
}
