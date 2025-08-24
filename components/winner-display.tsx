"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Star, Home, RefreshCw, Users } from "lucide-react"
import { Player } from "@/hooks/use-game-socket"

interface WinnerDisplayProps {
  players: Player[]
  onPlayAgain?: () => void
  onGoHome?: () => void
  isHost: boolean
  gameStats?: {
    totalRounds: number
    totalDrawTime: number
    averageGuessTime?: number
  }
}

export function WinnerDisplay({ players, onPlayAgain, onGoHome, isHost, gameStats }: WinnerDisplayProps) {
  const [showAllPlayers, setShowAllPlayers] = useState(false)

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]
  const topThree = sortedPlayers.slice(0, 3)
  const remainingPlayers = sortedPlayers.slice(3)

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 2:
        return <Medal className="w-5 h-5 text-orange-400" />
      default:
        return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 0:
        return "from-yellow-400/20 to-yellow-600/20 border-yellow-400/30"
      case 1:
        return "from-gray-400/20 to-gray-600/20 border-gray-400/30"
      case 2:
        return "from-orange-400/20 to-orange-600/20 border-orange-400/30"
      default:
        return "from-slate-600/20 to-slate-700/20 border-slate-500/30"
    }
  }

  const getRankSuffix = (rank: number) => {
    if (rank % 10 === 1 && rank % 100 !== 11) return "st"
    if (rank % 10 === 2 && rank % 100 !== 12) return "nd"
    if (rank % 10 === 3 && rank % 100 !== 13) return "rd"
    return "th"
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center relative overflow-hidden">
          {/* Confetti-like background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute top-12 left-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-8 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                <Trophy className="w-8 h-8 text-yellow-900" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">Game Complete!</CardTitle>
            <p className="text-gray-300 text-lg">Congratulations to all players!</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Winner Spotlight */}
          <div className={`p-6 rounded-lg bg-gradient-to-r ${getPodiumColor(0)} border relative overflow-hidden`}>
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                WINNER
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-6xl">{winner.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">{winner.name}</h2>
                </div>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{winner.score} points</p>
                <p className="text-sm text-gray-300">
                  🎉 Outstanding performance! You've claimed victory!
                </p>
              </div>
            </div>
          </div>

          {/* Top 3 Podium */}
          {topThree.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThree.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg bg-gradient-to-r ${getPodiumColor(index)} border transition-transform hover:scale-105`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {getPodiumIcon(index)}
                      </div>
                      <div className="text-3xl mb-2">{player.avatar}</div>
                      <h3 className="font-semibold text-white">{player.name}</h3>
                      <p className="text-xl font-bold text-white">{player.score}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {index + 1}{getRankSuffix(index + 1)} Place
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Players Rankings */}
          {remainingPlayers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  All Players ({players.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {showAllPlayers ? "Show Less" : "Show All"}
                </Button>
              </div>

              {showAllPlayers && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sortedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {index < 3 ? getPodiumIcon(index) : <span className="text-gray-400 font-mono">#{index + 1}</span>}
                        </div>
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <p className="font-semibold text-white">{player.name}</p>
                          {player.isHost && (
                            <Badge variant="secondary" className="text-xs mt-1">Host</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{player.score}</p>
                        <p className="text-xs text-gray-400">{index + 1}{getRankSuffix(index + 1)} place</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Game Statistics */}
          {gameStats && (
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Game Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Rounds</p>
                  <p className="text-white font-semibold">{gameStats.totalRounds}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Play Time</p>
                  <p className="text-white font-semibold">
                    {Math.floor(gameStats.totalDrawTime / 60)}m {gameStats.totalDrawTime % 60}s
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Players</p>
                  <p className="text-white font-semibold">{players.length}</p>
                </div>
                {gameStats.averageGuessTime && (
                  <div>
                    <p className="text-gray-400">Avg. Guess Time</p>
                    <p className="text-white font-semibold">{gameStats.averageGuessTime}s</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">Highest Score</p>
                  <p className="text-white font-semibold">{winner.score} pts</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Points</p>
                  <p className="text-white font-semibold">
                    {players.reduce((sum, p) => sum + p.score, 0)} pts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Messages */}
          <div className="text-center space-y-2">
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 animate-pulse" fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-300 italic">
              "Art is not what you see, but what you make others see." - Edgar Degas
            </p>
            <p className="text-sm text-gray-400">
              Thanks for playing DrawTogether! 🎨
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              onClick={onGoHome}
              variant="outline"
              className="flex-1 bg-transparent border-slate-600 text-white hover:bg-slate-700 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            {isHost && onPlayAgain && (
              <Button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            )}
            
            {!isHost && (
              <Button
                disabled
                className="flex-1 cursor-not-allowed opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Waiting for Host...
              </Button>
            )}
          </div>

          {/* Host Instructions */}
          {isHost && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300 text-center">
                💡 As the host, you can start a new game with the same or updated settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}