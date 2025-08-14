"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Palette,
  Brush,
  Eraser,
  Undo2,
  Redo2,
  Settings,
  Users,
  Clock,
  Trophy,
  Send,
  Home,
  Volume2,
  VolumeX,
  Plus,
} from "lucide-react"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { ColorPicker } from "@/components/color-picker"
import { BrushSettings } from "@/components/brush-settings"
import { GameChat } from "@/components/game-chat"
import { PlayersList } from "@/components/players-list"
import { WordDisplay } from "@/components/word-display"
import { CustomWordsManager } from "@/components/custom-words-manager"
import { useGameSocket } from "@/hooks/use-game-socket"

export default function GamePage() {
  const [currentTool, setCurrentTool] = useState<"brush" | "eraser">("brush")
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState("#ff4757")
  const [brushOpacity, setBrushOpacity] = useState(100)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCustomWords, setShowCustomWords] = useState(false)
  const [revealedLetters, setRevealedLetters] = useState<boolean[]>([])

  const canvasRef = useRef<any>(null)

  const {
    socket,
    isConnected,
    room,
    chatMessages,
    error,
    sendChatMessage,
    sendDrawingEvent,
    clearCanvas: clearCanvasSocket,
    kickPlayer,
    startGame,
  } = useGameSocket()

  const currentPlayer = room?.players.find((p) => p.socketId === socket?.id)
  const isDrawer = currentPlayer?.isDrawing || false
  const isHost = room?.players[0]?.socketId === socket?.id

  useEffect(() => {
    if (!socket) return

    const handleDrawingEvent = (event: any) => {
      if (canvasRef.current) {
        canvasRef.current.applyDrawingEvent(event)
      }
    }

    const handleCanvasCleared = () => {
      if (canvasRef.current) {
        canvasRef.current.clear()
      }
    }

    socket.on("drawing-event", handleDrawingEvent)
    socket.on("canvas-cleared", handleCanvasCleared)

    return () => {
      socket.off("drawing-event", handleDrawingEvent)
      socket.off("canvas-cleared", handleCanvasCleared)
    }
  }, [socket])

  useEffect(() => {
    if (!room?.currentWord) return

    const word = room.currentWord
    const timeLeft = room.timeLeft
    const totalTime = 90

    const halfTime = Math.floor(totalTime * 0.5)
    const seventyPercent = Math.floor(totalTime * 0.3)
    const ninetyPercent = Math.floor(totalTime * 0.1)

    const newRevealed = new Array(word.length).fill(false)

    // Always reveal spaces and special characters
    for (let i = 0; i < word.length; i++) {
      if (word[i] === " " || word[i] === "-" || word[i] === "'") {
        newRevealed[i] = true
      }
    }

    if (timeLeft <= halfTime) {
      const randomIndex = Math.floor(Math.random() * word.length)
      if (word[randomIndex] !== " " && word[randomIndex] !== "-" && word[randomIndex] !== "'") {
        newRevealed[randomIndex] = true
      }
    }

    if (timeLeft <= seventyPercent) {
      let count = 0
      while (count < 2) {
        const randomIndex = Math.floor(Math.random() * word.length)
        if (
          !newRevealed[randomIndex] &&
          word[randomIndex] !== " " &&
          word[randomIndex] !== "-" &&
          word[randomIndex] !== "'"
        ) {
          newRevealed[randomIndex] = true
          count++
        }
      }
    }

    if (timeLeft <= ninetyPercent) {
      let count = 0
      while (count < 3) {
        const randomIndex = Math.floor(Math.random() * word.length)
        if (
          !newRevealed[randomIndex] &&
          word[randomIndex] !== " " &&
          word[randomIndex] !== "-" &&
          word[randomIndex] !== "'"
        ) {
          newRevealed[randomIndex] = true
          count++
        }
      }
    }

    setRevealedLetters(newRevealed)
  }, [room?.timeLeft, room?.currentWord])

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
  }

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo()
    }
  }

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
      clearCanvasSocket()
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage)
      setChatMessage("")
    }
  }

  const handleDrawingEvent = (event: any) => {
    sendDrawingEvent(event)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Connecting to game server...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No room found</p>
          <Button onClick={() => (window.location.href = "/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Game Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => (window.location.href = "/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">DrawTogether</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className={`font-mono text-lg font-bold ${room.timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
              {Math.floor(room.timeLeft / 60)}:{(room.timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Room Info */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm">Room: {room.id}</span>
          </div>

          {/* Connection Status */}
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />

          {/* Custom Words (Host Only) */}
          {isHost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomWords(!showCustomWords)}
              className="text-gray-300 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-300 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mute */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Drawing Tools */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 p-4 space-y-4 overflow-y-auto">
          {/* Word Display */}
          <WordDisplay word={room.currentWord || ""} revealedLetters={revealedLetters} isDrawer={isDrawer} />

          {/* Custom Words Manager (Host Only) */}
          {showCustomWords && isHost && (
            <CustomWordsManager
              isHost={isHost}
              onWordsUpdated={() => {
                // Refresh word sets or notify other players
                console.log("Custom words updated")
              }}
            />
          )}

          {/* Drawing Tools */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Brush className="w-4 h-4" />
                Drawing Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool Selection */}
              <div className="flex gap-2">
                <Button
                  variant={currentTool === "brush" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool("brush")}
                  className="flex-1"
                  disabled={!isDrawer}
                >
                  <Brush className="w-4 h-4 mr-2" />
                  Brush
                </Button>
                <Button
                  variant={currentTool === "eraser" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool("eraser")}
                  className="flex-1"
                  disabled={!isDrawer}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Eraser
                </Button>
              </div>

              {/* Brush Size */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Brush Size: {brushSize}px</label>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={!isDrawer}
                />
              </div>

              {/* Brush Opacity */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Opacity: {brushOpacity}%</label>
                <Slider
                  value={[brushOpacity]}
                  onValueChange={(value) => setBrushOpacity(value[0])}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                  disabled={!isDrawer}
                />
              </div>

              {/* Color Picker */}
              <ColorPicker selectedColor={brushColor} onColorChange={setBrushColor} />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo || !isDrawer}
                  className="flex-1 bg-transparent"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo || !isDrawer}
                  className="flex-1 bg-transparent"
                >
                  <Redo2 className="w-4 h-4 mr-1" />
                  Redo
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCanvas}
                className="w-full"
                disabled={!isDrawer}
              >
                Clear Canvas
              </Button>
            </CardContent>
          </Card>

          {/* Players List */}
          <PlayersList
            players={room.players}
            onKickPlayer={kickPlayer}
            isHost={room.players[0]?.socketId === socket?.id}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <div className="h-full bg-white rounded-lg shadow-2xl overflow-hidden">
              <DrawingCanvas
                ref={canvasRef}
                tool={currentTool}
                brushSize={brushSize}
                brushColor={brushColor}
                brushOpacity={brushOpacity}
                onDrawingStart={() => setIsDrawing(true)}
                onDrawingEnd={() => setIsDrawing(false)}
                onUndoRedoChange={(undo, redo) => {
                  setCanUndo(undo)
                  setCanRedo(redo)
                }}
                onDrawingEvent={handleDrawingEvent}
                disabled={!isDrawer}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat & Leaderboard */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-l border-slate-700/50 flex flex-col">
          {/* Current Round Score */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">
                Round {room.round} of {room.maxRounds}
              </h3>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {room.gamePhase === "drawing" ? "Drawing Phase" : room.gamePhase === "waiting" ? "Waiting" : "Results"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Your Score: {currentPlayer?.score || 0} pts</span>
            </div>
            {room.currentWordCategory && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {room.currentWordCategory}
                </Badge>
                {room.currentWordIsCustom && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                    Custom
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <GameChat messages={chatMessages} currentPlayer={currentPlayer?.name || "You"} isDrawer={isDrawer} />

            {/* Chat Input */}
            {!isDrawer && room.gamePhase === "drawing" && (
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your guess..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <BrushSettings
          onClose={() => setShowSettings(false)}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushOpacity={brushOpacity}
          setBrushOpacity={setBrushOpacity}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {error}
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-2">
            Reload
          </Button>
        </div>
      )}
    </div>
  )
}
