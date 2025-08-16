"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Lock, Globe, RefreshCw, Clock, Gamepad2, X, Key } from "lucide-react"

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
  onClose: () => void
  onJoinRoom: (roomId: string, password?: string) => void
  onRefresh: () => void
}

export function RoomBrowser({ onClose, onJoinRoom, onRefresh }: RoomBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showPrivateRooms, setShowPrivateRooms] = useState(false)
  const [privateRoomId, setPrivateRoomId] = useState("")
  const [privateRoomPassword, setPrivateRoomPassword] = useState("")
  const [passwordPrompt, setPasswordPrompt] = useState<{ roomId: string; roomName: string } | null>(null)
  const [promptPassword, setPromptPassword] = useState("")
  
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
      id: "PASS123",
      name: "Private Art Club",
      playerCount: 4,
      maxPlayers: 8,
      gamePhase: "waiting",
      round: 0,
      maxRounds: 5,
      difficulty: "medium",
      categories: ["Animals", "Objects"],
      host: "SecretArtist",
      isPrivate: false,
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

  const handleJoinPrivateRoom = () => {
    if (privateRoomId.trim()) {
      onJoinRoom(privateRoomId.trim(), privateRoomPassword.trim() || undefined)
      setPrivateRoomId("")
      setPrivateRoomPassword("")
    }
  }

  const handleRoomJoin = (room: PublicRoom) => {
    if (room.playerCount >= room.maxPlayers) {
      return // Room is full
    }

    if (room.hasPassword) {
      // Show password prompt
      setPasswordPrompt({ roomId: room.id, roomName: room.name })
      setPromptPassword("")
    } else {
      // Join directly
      onJoinRoom(room.id)
    }
  }

  const handlePasswordSubmit = () => {
    if (passwordPrompt && promptPassword.trim()) {
      onJoinRoom(passwordPrompt.roomId, promptPassword.trim())
      setPasswordPrompt(null)
      setPromptPassword("")
    }
  }

  const handlePasswordCancel = () => {
    setPasswordPrompt(null)
    setPromptPassword("")
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Browse Rooms
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onRefresh} className="cursor-pointer hover:bg-slate-700">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer hover:bg-slate-700">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Room Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={!showPrivateRooms ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPrivateRooms(false)}
                className="cursor-pointer"
              >
                <Globe className="w-4 h-4 mr-2" />
                Public Rooms
              </Button>
              <Button
                variant={showPrivateRooms ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPrivateRooms(true)}
                className="cursor-pointer"
              >
                <Lock className="w-4 h-4 mr-2" />
                Private Room
              </Button>
            </div>

            {!showPrivateRooms ? (
              <>
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
                      className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm cursor-pointer hover:bg-slate-700"
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
                      className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm cursor-pointer hover:bg-slate-700"
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
                        className="cursor-pointer"
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
                              {room.gamePhase === "waiting"
                                ? "Waiting"
                                : room.gamePhase === "drawing"
                                  ? "Playing"
                                  : "Results"}
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
                            onClick={() => handleRoomJoin(room)}
                            disabled={room.playerCount >= room.maxPlayers}
                            className="bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed"
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
              </>
            ) : (
              /* Private Room Join */
              <div className="space-y-4 py-8">
                <div className="text-center mb-6">
                  <Key className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                  <h3 className="text-lg font-medium text-white mb-2">Join Private Room</h3>
                  <p className="text-gray-400 text-sm">Enter the room ID and password to join a private room</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room ID</label>
                    <Input
                      placeholder="Enter room ID..."
                      value={privateRoomId}
                      onChange={(e) => setPrivateRoomId(e.target.value.toUpperCase())}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password (optional)</label>
                    <Input
                      type="password"
                      placeholder="Enter password if required..."
                      value={privateRoomPassword}
                      onChange={(e) => setPrivateRoomPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <Button
                    onClick={handleJoinPrivateRoom}
                    disabled={!privateRoomId.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Join Private Room
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Prompt Modal */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                Room Password Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-300 mb-4">
                  "{passwordPrompt.roomName}" requires a password to join.
                </p>
                <Input
                  type="password"
                  placeholder="Enter room password..."
                  value={promptPassword}
                  onChange={(e) => setPromptPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePasswordCancel}
                  className="flex-1 bg-transparent border-slate-600 text-white hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordSubmit}
                  disabled={!promptPassword.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed"
                >
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}