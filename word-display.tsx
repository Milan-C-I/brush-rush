"use client"

import { Badge } from "@/components/ui/badge"

interface WordDisplayProps {
  word: string
  revealedLetters: boolean[]
  isDrawer: boolean
  category?: string
  difficulty?: string
}

export function WordDisplay({ word, revealedLetters, isDrawer, category, difficulty }: WordDisplayProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-500/20 text-green-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-blue-500/20 text-blue-400"
    }
  }

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{isDrawer ? "Your Word" : "Guess the Word"}</h3>
        <div className="flex gap-2">
          {category && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
              {category}
            </Badge>
          )}
          {difficulty && (
            <Badge variant="secondary" className={`text-xs ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-3 flex-wrap">
        {word.split("").map((letter, index) => (
          <div
            key={index}
            className={`w-8 h-10 rounded flex items-center justify-center border-2 ${
              letter === " " ? "w-4 bg-transparent border-transparent" : "bg-slate-600 border-slate-500"
            }`}
          >
            <span className="text-lg font-bold text-white">
              {letter === " " ? "" : isDrawer || revealedLetters[index] ? letter : ""}
            </span>
          </div>
        ))}
      </div>

      {!isDrawer && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Letters revealed: {revealedLetters.filter(Boolean).length} / {word.replace(/\s/g, "").length}
          </p>
        </div>
      )}

      {isDrawer && (
        <div className="text-center">
          <p className="text-xs text-green-400">Draw this word for others to guess!</p>
          {category && <p className="text-xs text-gray-400 mt-1">Category: {category}</p>}
        </div>
      )}
    </div>
  )
}
