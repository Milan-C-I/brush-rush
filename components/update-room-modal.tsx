"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Settings, Lock, Globe, RefreshCw } from "lucide-react"
import { Room } from "@/hooks/use-game-socket"

interface UpdateRoomModalProps {
  onClose: () => void
  onUpdateRoom: (roomData: any) => void
  currentRoom: Room
  isHost: boolean
}

export function UpdateRoomModal({ onClose, onUpdateRoom, currentRoom, isHost }: UpdateRoomModalProps) {
  const [isPrivate, setIsPrivate] = useState(currentRoom?.isPrivate || false)
  const [password, setPassword] = useState(currentRoom?.password || "")
  const [maxPlayers, setMaxPlayers] = useState([currentRoom?.maxPlayers || 8])
  const [maxRounds, setMaxRounds] = useState([currentRoom?.rounds || 5])
  const [roundTime, setRoundTime] = useState([currentRoom?.drawTime || 90])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customWords, setCustomWords] = useState(currentRoom?.customWords?.join(", ") || "")
  const [difficulty, setDifficulty] = useState("mixed")

  const availableCategories = ["Animals", "Objects", "Food", "Nature", "Actions", "Abstract"]

  useEffect(() => {
    // Initialize with current room settings
    if (currentRoom) {
      setIsPrivate(currentRoom.isPrivate || false)
      setPassword(currentRoom.password || "")
      setMaxPlayers([currentRoom.maxPlayers || 8])
      setMaxRounds([currentRoom.rounds || 5])
      setRoundTime([currentRoom.drawTime || 90])
      setCustomWords(currentRoom.customWords?.join(", ") || "")
      // Default categories if not available
      setSelectedCategories(["Animals", "Objects", "Food", "Nature"])
    }
  }, [currentRoom])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleUpdateRoom = () => {
    if (!isHost) {
      alert("Only the host can update room settings")
      return
    }

    if (selectedCategories.length === 0) {
      alert("Please select at least one category")
      return
    }

    if (isPrivate && !password.trim()) {
      alert("Please enter a password for private room")
      return
    }

    const roomData = {
      roomId: currentRoom.id,
      isPrivate,
      password: isPrivate ? password.trim() : undefined,
      maxPlayers: maxPlayers[0],
      rounds: maxRounds[0],
      drawTime: roundTime[0],
      customWords: customWords
        .split(",")
        .map((word) => word.trim())
        .filter((word) => word.length > 0),
      categories: selectedCategories,
      difficulty,
    }

    onUpdateRoom(roomData)
  }

  const handleRestartGame = () => {
    if (!isHost) {
      alert("Only the host can restart the game")
      return
    }

    // Update room settings and restart
    handleUpdateRoom()
  }

  if (!isHost) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Room Settings</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer hover:bg-slate-700">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-300 mb-4">Only the host can modify room settings</p>
            <Button onClick={onClose} className="cursor-pointer">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Update Room Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer hover:bg-slate-700">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <Lock className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Globe className="w-4 h-4 text-green-400" />
                )}
                <Label className="text-gray-300">{isPrivate ? "Private Room" : "Public Room"}</Label>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            {isPrivate && (
              <div>
                <Label className="text-gray-300">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter room password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                  maxLength={20}
                />
              </div>
            )}
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Game Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Max Players: {maxPlayers[0]}</Label>
                <Slider value={maxPlayers} onValueChange={setMaxPlayers} max={12} min={2} step={1} className="mt-2" />
              </div>

              <div>
                <Label className="text-gray-300">Max Rounds: {maxRounds[0]}</Label>
                <Slider value={maxRounds} onValueChange={setMaxRounds} max={10} min={3} step={1} className="mt-2" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Round Time: {roundTime[0]}s</Label>
                <Slider value={roundTime} onValueChange={setRoundTime} max={180} min={30} step={15} className="mt-2" />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Difficulty Level</Label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white cursor-pointer hover:bg-slate-700"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed (Recommended)</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-gray-300 mb-3 block">Word Categories ({selectedCategories.length} selected)</Label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "border-slate-500 text-gray-300 hover:bg-slate-700"
                  }`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-red-400 text-sm mt-2">Please select at least one category</p>
            )}
          </div>

          {/* Custom Words */}
          <div>
            <Label className="text-gray-300 mb-2 block">Custom Words (comma-separated)</Label>
            <Input
              placeholder="apple, house, car, happy..."
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              Add your own words to make the game more personalized
            </p>
          </div>

          {/* Current Room Info */}
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Current Room Status</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Room ID: <span className="text-white">{currentRoom?.id}</span></p>
              <p>Players: <span className="text-white">{currentRoom?.players?.length || 0}/{currentRoom?.maxPlayers}</span></p>
              <p>Game State: <span className="text-white capitalize">{currentRoom?.gameState}</span></p>
              {currentRoom?.gameState === "playing" && (
                <p>Round: <span className="text-white">{currentRoom?.currentRound}/{currentRoom?.rounds}</span></p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h4 className="text-sm font-medium text-blue-300 mb-2">Updated Settings Preview</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <p>
                {maxPlayers[0]} players • {maxRounds[0]} rounds • {roundTime[0]}s per round
              </p>
              <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              <p>Categories: {selectedCategories.join(", ")}</p>
              {customWords.trim() && (
                <p>Custom words: {customWords.split(",").filter(w => w.trim()).length} added</p>
              )}
              <p className="flex items-center gap-1">
                {isPrivate ? (
                  <>
                    <Lock className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">Private</span>
                    {password && <span className="text-gray-400">(Password protected)</span>}
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Public</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-slate-600 text-white hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRoom}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
              disabled={selectedCategories.length === 0 || (isPrivate && !password.trim())}
            >
              Update Settings
            </Button>
            {currentRoom?.gameState !== "playing" && (
              <Button
                onClick={handleRestartGame}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer"
                disabled={selectedCategories.length === 0 || (isPrivate && !password.trim())}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}