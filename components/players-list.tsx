"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, UserX } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar: string
  score: number
  isHost: boolean
  hasGuessed: boolean
}

interface PlayersListProps {
  players: Player[]
  onKickPlayer: (playerId: string) => void
  isHost: boolean
}

export function PlayersList({ players, onKickPlayer, isHost }: PlayersListProps) {
  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Users className="w-4 h-4" />
          Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-slate-600/30 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{player.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{player.name}</span>
                  {player.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                  {player.hasGuessed && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Guessed
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">{player.score} pts</div>
              </div>
            </div>

            {isHost && !player.isHost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onKickPlayer(player.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <UserX className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
