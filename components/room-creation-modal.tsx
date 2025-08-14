"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Settings, Lock, Globe } from "lucide-react"

interface RoomCreationModalProps {
  onClose: () => void
  onCreateRoom: (roomData: any) => void
  playerData: any
}

export function RoomCreationModal({ onClose, onCreateRoom, playerData }: RoomCreationModalProps) {
  const [roomName, setRoomName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState("")
  const [maxPlayers, setMaxPlayers] = useState([8])
  const [maxRounds, setMaxRounds] = useState([5])
  const [roundTime, setRoundTime] = useState([90])
  const [difficulty, setDifficulty] = useState("mixed")
  const [selectedCategories, setSelectedCategories] = useState(["Animals", "Objects", "Food", "Nature"])

  const availableCategories = ["Animals", "Objects", "Food", "Nature", "Actions", "Abstract"]

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleCreateRoom = () => {
    if (!roomName.trim()) return
    if (selectedCategories.length === 0) return
    if (isPrivate && !password.trim()) return

    const roomData = {
      name: roomName,
      isPrivate,
      password: isPrivate ? password : undefined,
      maxPlayers: maxPlayers[0],
      maxRounds: maxRounds[0],
      settings: {
        roundTime: roundTime[0],
        maxRounds: maxRounds[0],
        difficulty,
        categories: selectedCategories,
        pointsForCorrectGuess: 100,
        pointsForDrawer: 50,
        hintTimings: [50, 70, 90],
      },
    }

    onCreateRoom(roomData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-400" />
            Create New Room
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Room Name</Label>
              <Input
                placeholder="Enter room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                maxLength={30}
              />
            </div>

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

              <div>
                <Label className="text-gray-300">Round Time: {roundTime[0]}s</Label>
                <Slider value={roundTime} onValueChange={setRoundTime} max={180} min={30} step={15} className="mt-2" />
              </div>

              <div>
                <Label className="text-gray-300">Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
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

          {/* Preview */}
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Room Preview</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <p>
                <span className="text-white">{roomName || "Untitled Room"}</span> by {playerData?.name}
              </p>
              <p>
                {maxPlayers[0]} players • {maxRounds[0]} rounds • {roundTime[0]}s per round
              </p>
              <p>
                Difficulty: {difficulty} • Categories: {selectedCategories.join(", ")}
              </p>
              <p>{isPrivate ? "🔒 Private" : "🌐 Public"}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={!roomName.trim() || selectedCategories.length === 0 || (isPrivate && !password.trim())}
            >
              Create Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
