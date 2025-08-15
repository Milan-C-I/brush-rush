"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Palette, Users, Settings, HelpCircle, Plus, Search, Loader2 } from "lucide-react"
import { useGameSocket } from "@/hooks/use-game-socket"
import { RoomCreationModal } from "@/components/room-creation-modal"
import { RoomBrowser } from "@/components/room-browser"
import { AnimatedCounter } from "@/components/animated-counter"
import Link from "next/link"

export default function HomePage() {
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showRoomBrowser, setShowRoomBrowser] = useState(false)

  const { createRoom, joinRoom, error, isLoading, setError } = useGameSocket()

  const avatarOptions = [
    { id: 0, color: "bg-red-500", icon: "🎨" },
    { id: 1, color: "bg-blue-500", icon: "✏️" },
    { id: 2, color: "bg-green-500", icon: "🖌️" },
    { id: 3, color: "bg-purple-500", icon: "🎭" },
    { id: 4, color: "bg-yellow-500", icon: "🌟" },
    { id: 5, color: "bg-pink-500", icon: "💫" },
  ]

  useEffect(() => {
    if (username.trim()) {
      localStorage.setItem("playerName", username)
      localStorage.setItem("playerAvatar", avatarOptions[selectedAvatar].icon)
    }
  }, [username, selectedAvatar, avatarOptions])

  const playerData = {
    id: Date.now().toString(),
    name: username,
    avatar: avatarOptions[selectedAvatar].icon,
  }

  const handleCreateRoom = (roomData: any) => {
    if (!username.trim()) return
    createRoom(roomData, playerData)
    setShowCreateRoom(false)
  }

  const handleJoinRoom = (roomId: string, password?: string) => {
    if (!username.trim()) return
    joinRoom(roomId, playerData, password)
  }

  const handleQuickJoin = () => {
    if (!username.trim() || !roomCode.trim()) return
    joinRoom(roomCode, playerData)
  }

  const handleRefreshRooms = () => {
    console.log("Refreshing rooms...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-6 border-b border-slate-700/50 animate-slide-in-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center animate-float">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            DrawTogether
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/tutorial">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover-lift btn-press cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              How to Play
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover-lift btn-press cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Unleash Your Creativity!
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join friends and draw together in real-time. Guess words, earn points, and become the ultimate artist!
          </p>

          {/* Enhanced stats with animated counters */}
          <div className="flex justify-center gap-8 mb-12 stagger-children">
            <div
              className="text-center animate-scale-in cursor-pointer hover:scale-105 transition-transform"
              style={{ "--stagger-delay": 1 } as any}
            >
              <div className="text-3xl font-bold text-red-400">
                <AnimatedCounter value={1247} />
              </div>
              <div className="text-sm text-gray-400">Players Online</div>
            </div>
            <div
              className="text-center animate-scale-in cursor-pointer hover:scale-105 transition-transform"
              style={{ "--stagger-delay": 2 } as any}
            >
              <div className="text-3xl font-bold text-blue-400">
                <AnimatedCounter value={89} />
              </div>
              <div className="text-sm text-gray-400">Active Rooms</div>
            </div>
            <div
              className="text-center animate-scale-in cursor-pointer hover:scale-105 transition-transform"
              style={{ "--stagger-delay": 3 } as any}
            >
              <div className="text-3xl font-bold text-green-400">
                <AnimatedCounter value={15632} />
              </div>
              <div className="text-sm text-gray-400">Drawings Created</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto stagger-children">
          {/* Enhanced cards with hover effects and animations */}
          <Card
            className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover-lift animate-slide-in-left hover:border-slate-600 transition-all duration-300"
            style={{ "--stagger-delay": 1 } as any}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-red-400" />
                Customize Your Avatar
              </CardTitle>
              <CardDescription className="text-gray-400">Choose your unique identity for the game</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 cursor-pointer">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 cursor-text"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 cursor-pointer">Avatar</label>
                  <div className="grid grid-cols-3 gap-3">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        disabled={isLoading}
                        className={`w-16 h-16 rounded-xl ${avatar.color} flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105 btn-press cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                          selectedAvatar === avatar.id
                            ? "ring-2 ring-red-400 ring-offset-2 ring-offset-slate-800 animate-pulse-glow"
                            : ""
                        }`}
                      >
                        {avatar.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Game Actions */}
          <Card
            className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover-lift animate-fade-in hover:border-slate-600 transition-all duration-300"
            style={{ "--stagger-delay": 2 } as any}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="w-5 h-5 text-blue-400" />
                Start Playing
              </CardTitle>
              <CardDescription className="text-gray-400">Create or join a room to begin drawing</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <Button
                onClick={() => setShowCreateRoom(true)}
                disabled={!username.trim() || isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 hover-lift btn-press transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Room
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-gray-400">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 cursor-text"
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <Button
                    onClick={handleQuickJoin}
                    disabled={!username.trim() || !roomCode.trim() || isLoading}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700 btn-press cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-transparent"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                  </Button>
                </div>

                <Button
                  onClick={() => setShowRoomBrowser(true)}
                  disabled={!username.trim() || isLoading}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700 hover-lift btn-press cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Browse Rooms
                </Button>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg animate-bounce-in border border-red-400/20">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-2 text-red-300 hover:text-red-100 cursor-pointer hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Leaderboard */}
          <Card
            className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover-lift animate-slide-in-right hover:border-slate-600 transition-all duration-300"
            style={{ "--stagger-delay": 3 } as any}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-green-400" />
                Global Leaderboard
              </CardTitle>
              <CardDescription className="text-gray-400">Top players this week</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="space-y-3">
                {[
                  { name: "ArtMaster", score: 2847, avatar: "🎨" },
                  { name: "SketchKing", score: 2634, avatar: "✏️" },
                  { name: "DrawWizard", score: 2521, avatar: "🖌️" },
                  { name: "ColorQueen", score: 2398, avatar: "🎭" },
                  { name: "PaintPro", score: 2276, avatar: "🌟" },
                ].map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 hover-lift animate-slide-in-left cursor-pointer hover:scale-[1.02]"
                    style={{ "--stagger-delay": index + 1 } as any}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                      <span
                        className="text-xl animate-float cursor-pointer"
                        style={{ animationDelay: `${index * 0.5}s` }}
                      >
                        {player.avatar}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">
                        <AnimatedCounter value={player.score} duration={1500} /> pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showCreateRoom && (
        <RoomCreationModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
          playerData={playerData}
        />
      )}

      {showRoomBrowser && (
        <RoomBrowser
          onClose={() => setShowRoomBrowser(false)}
          onJoinRoom={handleJoinRoom}
          onRefresh={handleRefreshRooms}
        />
      )}
    </div>
  )
}
