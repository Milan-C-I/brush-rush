"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Clock, Star } from "lucide-react"

interface GameResultsProps {
  results: {
    winner: string
    finalScores: Array<{
      rank: number
      name: string
      totalScore: number
      accuracy: number
      correctGuesses: number
      totalGuesses: number
    }>
  }
  onPlayAgain: () => void
  onLeaveRoom: () => void
}

export function GameResults({ results, onPlayAgain, onLeaveRoom }: GameResultsProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <CardTitle className="text-2xl text-white">Game Over!</CardTitle>
          </div>
          <div className="text-lg text-yellow-400">🎉 {results.winner} Wins! 🎉</div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Final Leaderboard */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Final Standings
            </h3>
            <div className="space-y-3">
              {results.finalScores.map((player) => (
                <div
                  key={player.name}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    player.rank === 1
                      ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30"
                      : player.rank === 2
                        ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                        : player.rank === 3
                          ? "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30"
                          : "bg-slate-700/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      player.rank === 1
                        ? "bg-yellow-500 text-black"
                        : player.rank === 2
                          ? "bg-gray-400 text-black"
                          : player.rank === 3
                            ? "bg-amber-600 text-white"
                            : "bg-slate-600 text-white"
                    }`}
                  >
                    {player.rank}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{player.name}</span>
                      {player.rank <= 3 && (
                        <span className="text-lg">{player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {player.totalScore} pts
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {player.accuracy}% accuracy
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {player.correctGuesses}/{player.totalGuesses} correct
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`${
                      player.accuracy >= 80
                        ? "bg-green-500/20 text-green-400"
                        : player.accuracy >= 60
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {player.accuracy >= 80 ? "Excellent" : player.accuracy >= 60 ? "Good" : "Needs Practice"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Play Again
            </Button>
            <Button onClick={onLeaveRoom} variant="outline" className="flex-1 bg-transparent">
              Leave Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
