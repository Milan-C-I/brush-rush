"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Lock, Globe, RefreshCw, Clock, Gamepad2 } from "lucide-react"

interface PublicRoom {
  id: string
  name: string
  playerCount: number
  maxPlayers: number
  gamePhase: "waiting" | "drawing" | "results"
  round: number
  maxRounds: number
  difficulty: string
  categories: string[]
  host: string
  isPrivate: boolean
  hasPassword: boolean
}

interface RoomBrowserProps {
  onJoinRoom: (roomId: string, password?: string) => void
  onRefresh: () => void
}

export function RoomBrowser({ onJoinRoom, onRefresh }: RoomBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [rooms, setRooms] = useState<PublicRoom[]>([
    {
      id: "ART123",
      name: "Beginner's Lounge",
      playerCount: 8,
      maxPlayers: 12,
      gamePhase: "drawing",
      round: 2,
      maxRounds: 5,
      difficulty: "easy",
      categories: ["Animals", "Food"],
      host: "ArtMaster99",
      isPrivate: false,
      hasPassword: false,
    },
    {
      id: "PRO456",
      name: "Pro Artists Only",
      playerCount: 6,
      maxPlayers: 8,
      gamePhase: "waiting",
      round: 0,
      maxRounds: 7,
      difficulty: "hard",
      categories: ["Abstract", "Actions"],
      host: "SketchQueen",
      isPrivate: false,
      hasPassword: false,
    },
    {
      id: "FUN789",
      name: "Random Fun Room",
      playerCount: 10,
      maxPlayers: 12,
      gamePhase: "results",
      round: 3,
      maxRounds: 5,
      difficulty: "mixed",
      categories: ["Animals", "Objects", "Nature"],
      host: "DrawingNinja",
      isPrivate: false,
      hasPassword: false,
    },
    {
      id: "VIP001",
      name: "VIP Members",
      playerCount: 4,
      maxPlayers: 6,
      gamePhase: "waiting",
      round: 0,
      maxRounds: 5,
      difficulty: "medium",
      categories: ["Objects", "Nature"],
      host: "ColorWizard",
      isPrivate: true,
      hasPassword: true,
    },
  ])

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty = filterDifficulty === "all" || room.difficulty === filterDifficulty

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "waiting" && room.gamePhase === "waiting") ||
      (filterStatus === "playing" && room.gamePhase !== "waiting") ||
      (filterStatus === "available" && room.playerCount < room.maxPlayers)

    return matchesSearch && matchesDifficulty && matchesStatus && !room.isPrivate
  })

  const getStatusColor = (phase: string) => {
    switch (phase) {
      case "waiting":
        return "bg-green-500/20 text-green-400"
      case "drawing":
        return "bg-blue-500/20 text-blue-400"
      case "results":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "hard":
        return "bg-red-500/20 text-red-400"
      case "mixed":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Public Rooms
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rooms or hosts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
            >
              <option value="all">All Rooms</option>
              <option value="waiting">Waiting to Start</option>
              <option value="playing">Currently Playing</option>
              <option value="available">Has Space</option>
            </select>
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rooms found matching your criteria</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setFilterDifficulty("all")
                  setFilterStatus("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{room.name}</h4>
                      {room.hasPassword && <Lock className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <p className="text-sm text-gray-400">Hosted by {room.host}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(room.gamePhase)}>
                      {room.gamePhase === "waiting" ? "Waiting" : room.gamePhase === "drawing" ? "Playing" : "Results"}
                    </Badge>
                    <Badge variant="secondary" className={getDifficultyColor(room.difficulty)}>
                      {room.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.playerCount}/{room.maxPlayers}
                    </div>
                    {room.gamePhase !== "waiting" && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Round {room.round}/{room.maxRounds}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onJoinRoom(room.id)}
                    disabled={room.playerCount >= room.maxPlayers}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {room.playerCount >= room.maxPlayers ? "Full" : "Join"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {room.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs border-slate-500 text-gray-300">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
