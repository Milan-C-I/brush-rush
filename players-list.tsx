"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Palette, MoreVertical, UserX, Volume2, VolumeX, Shield, Copy } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar: string
  score: number
  roundScore?: number
  isDrawing: boolean
  socketId: string
  hasGuessedCorrectly?: boolean
  isHost?: boolean
  isMuted?: boolean
}

interface PlayersListProps {
  players: Player[]
  onKickPlayer?: (playerId: string) => void
  onMutePlayer?: (playerId: string) => void
  onPromotePlayer?: (playerId: string) => void
  isHost?: boolean
  currentPlayerId?: string
}

export function PlayersList({
  players,
  onKickPlayer,
  onMutePlayer,
  onPromotePlayer,
  isHost = false,
  currentPlayerId,
}: PlayersListProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/join/${window.location.pathname.split("/").pop()}`
    navigator.clipboard.writeText(roomLink)
  }

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          Players ({players.length}/12)
        </h3>

        <Button variant="ghost" size="sm" onClick={copyRoomLink} className="text-gray-400 hover:text-white">
          <Copy className="w-3 h-3 mr-1" />
          Invite
        </Button>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`relative flex items-center gap-3 p-2 rounded-lg transition-colors ${
              player.isDrawing
                ? "bg-blue-500/20 border border-blue-500/30"
                : player.hasGuessedCorrectly
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-slate-600/30 hover:bg-slate-600/50"
            } ${player.id === currentPlayerId ? "ring-1 ring-blue-400" : ""}`}
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-slate-600 text-sm">{player.avatar}</AvatarFallback>
              </Avatar>

              {player.isDrawing && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Palette className="w-2 h-2 text-white" />
                </div>
              )}

              {player.hasGuessedCorrectly && !player.isDrawing && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate flex items-center gap-1">
                  {player.name}
                  {index === 0 && <Crown className="w-3 h-3 text-yellow-400" />}
                  {player.isHost && <Shield className="w-3 h-3 text-blue-400" />}
                  {player.isMuted && <VolumeX className="w-3 h-3 text-red-400" />}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{player.score} pts</span>
                {player.roundScore && player.roundScore > 0 && (
                  <span className="text-green-400">+{player.roundScore}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {player.isDrawing && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                  Drawing
                </Badge>
              )}

              {player.hasGuessedCorrectly && !player.isDrawing && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                  Correct!
                </Badge>
              )}

              {/* Player Actions Menu */}
              {isHost && player.id !== currentPlayerId && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>

                  {selectedPlayer === player.id && (
                    <div className="absolute right-0 top-8 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 min-w-32">
                      <div className="p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            onMutePlayer?.(player.id)
                            setSelectedPlayer(null)
                          }}
                        >
                          {player.isMuted ? (
                            <>
                              <Volume2 className="w-3 h-3 mr-2" />
                              Unmute
                            </>
                          ) : (
                            <>
                              <VolumeX className="w-3 h-3 mr-2" />
                              Mute
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            onPromotePlayer?.(player.id)
                            setSelectedPlayer(null)
                          }}
                        >
                          <Shield className="w-3 h-3 mr-2" />
                          Make Host
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8 text-red-400 hover:text-red-300"
                          onClick={() => {
                            onKickPlayer?.(player.id)
                            setSelectedPlayer(null)
                          }}
                        >
                          <UserX className="w-3 h-3 mr-2" />
                          Kick
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room Stats */}
      <div className="mt-4 pt-3 border-t border-slate-600/50">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <span className="text-white font-medium">{players.filter((p) => p.hasGuessedCorrectly).length}</span>
            <span className="ml-1">correct guesses</span>
          </div>
          <div>
            <span className="text-white font-medium">{Math.max(...players.map((p) => p.score))}</span>
            <span className="ml-1">highest score</span>
          </div>
        </div>
      </div>
    </div>
  )
}
