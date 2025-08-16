"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "./use-socket"

export interface Room {
  id: string
  name: string
  maxPlayers: number
  isPrivate: boolean
  password?: string
  customWords: string[]
  rounds: number
  drawTime: number
  gamePhase: "waiting" | "drawing"
  currentWordCategory: string
  currentWordIsCustom: boolean
  players: Player[]
  currentRound: number
  currentDrawer: Player | null
  currentWord: string | null
  gameState: "waiting" | "playing" | "finished"
  timeLeft: number
  scores: Record<string, number>
  usedWords: string[]
  drawingData: any[]
}

export interface Player {
  id: string
  name: string
  avatar: string
  score: number
  isHost: boolean
  isDrawing: boolean
  socketId: string
  hasGuessed: boolean
}

export interface ChatMessage {
  id: number
  player: string
  message: string
  type: "chat" | "system"
  timestamp: number
}

export function useGameSocket() {
  const { socket, isConnected } = useSocket()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const joinRoom = useCallback((roomId: string, player: any, password?: string) => {
    if (socket && isConnected && !isLoading) {
      console.log("[GameSocket] Attempting to join room:", roomId, "with player:", player)
      setIsLoading(true)
      setError(null)
      socket.emit("join-room", { roomId, player, password })
    } else {
      console.log("[GameSocket] Cannot join room - socket:", !!socket, "loading:", isLoading, "connected:", isConnected)
      if (!isConnected) {
        setError("Not connected to server. Please wait and try again.")
      }
    }
  }, [socket, isLoading, isConnected])

  const createRoom = useCallback((roomData: any, player: any) => {
    if (socket && isConnected && !isLoading) {
      console.log("[GameSocket] Creating room with data:", roomData, "player:", player)
      setIsLoading(true)
      setError(null)
      socket.emit("create-room", { roomData, player })
    } else {
      console.log("[GameSocket] Cannot create room - socket:", !!socket, "loading:", isLoading, "connected:", isConnected)
      if (!isConnected) {
        setError("Not connected to server. Please wait and try again.")
      }
    }
  }, [socket, isLoading, isConnected])

  useEffect(() => {
    if (!socket) return

    console.log("[GameSocket] Setting up socket listeners")

    // Room events
    const handleRoomCreated = ({ roomId, room }: { roomId: string, room: Room }) => {
      console.log("[GameSocket] Room created successfully:", roomId, room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
      // Navigate to the game page after successful room creation
      router.push(`/game?roomId=${roomId}`)
    }

    const handleRoomJoined = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Room joined successfully:", room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
    }

    const handlePlayerJoined = ({ player, players }: { player: Player, players: Player[] }) => {
      console.log("[GameSocket] Player joined:", player)
      setRoom((prev) => (prev ? { ...prev, players } : null))
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          player: "System",
          message: `${player.name} joined the room`,
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }

    const handlePlayerLeft = ({ player, players }: { player: Player, players: Player[] }) => {
      console.log("[GameSocket] Player left:", player)
      setRoom((prev) => (prev ? { ...prev, players } : null))
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          player: "System",
          message: `${player.name} left the room`,
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }

    const handleGameStarted = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Game started:", room)
      setRoom(room)
    }

    const handleRoundStarted = ({ room, word, drawer }: { room: Room, word: string, drawer: Player }) => {
      console.log("[GameSocket] Round started:", { room, word, drawer })
      setRoom(room)
    }

    const handleTimerUpdate = ({ timeLeft }: { timeLeft: number }) => {
      setRoom((prev) => prev ? { ...prev, timeLeft } : null)
    }

    // Chat events
    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message])
    }

    const handleCorrectGuess = ({ player, word, points }: { player: string, word: string, points: number }) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          player: "System",
          message: `${player} guessed "${word}" correctly! (+${points} points)`,
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }

    // Drawing events
    const handleDrawingEvent = (event: any) => {
      // Forward to canvas if needed
      console.log("[GameSocket] Drawing event received:", event)
    }

    const handleCanvasCleared = () => {
      console.log("[GameSocket] Canvas cleared")
    }

    // Error handling
    const handleError = ({ message }: { message: string }) => {
      console.error("[GameSocket] Error:", message)
      setError(message)
      setIsLoading(false)
    }

    const handleKicked = () => {
      console.log("[GameSocket] Player was kicked")
      setError("You have been kicked from the room")
      setRoom(null)
      setIsLoading(false)
      router.push("/")
    }

    const handleGameFinished = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Game finished:", room)
      setRoom(room)
    }

    // Register all event listeners
    socket.on("room-created", handleRoomCreated)
    socket.on("room-joined", handleRoomJoined)
    socket.on("player-joined", handlePlayerJoined)
    socket.on("player-left", handlePlayerLeft)
    socket.on("game-started", handleGameStarted)
    socket.on("round-started", handleRoundStarted)
    socket.on("timer-update", handleTimerUpdate)
    socket.on("chat-message", handleChatMessage)
    socket.on("correct-guess", handleCorrectGuess)
    socket.on("drawing-event", handleDrawingEvent)
    socket.on("canvas-cleared", handleCanvasCleared)
    socket.on("error", handleError)
    socket.on("kicked", handleKicked)
    socket.on("game-finished", handleGameFinished)

    return () => {
      console.log("[GameSocket] Cleaning up socket listeners")
      socket.off("room-created", handleRoomCreated)
      socket.off("room-joined", handleRoomJoined)
      socket.off("player-joined", handlePlayerJoined)
      socket.off("player-left", handlePlayerLeft)
      socket.off("game-started", handleGameStarted)
      socket.off("round-started", handleRoundStarted)
      socket.off("timer-update", handleTimerUpdate)
      socket.off("chat-message", handleChatMessage)
      socket.off("correct-guess", handleCorrectGuess)
      socket.off("drawing-event", handleDrawingEvent)
      socket.off("canvas-cleared", handleCanvasCleared)
      socket.off("error", handleError)
      socket.off("kicked", handleKicked)
      socket.off("game-finished", handleGameFinished)
    }
  }, [socket, router])

  const startGame = () => {
    if (socket && room && isConnected) {
      socket.emit("start-game", { roomId: room.id })
    }
  }

  const sendChatMessage = (message: string) => {
    if (socket && room && isConnected) {
      socket.emit("chat-message", { roomId: room.id, message })
    }
  }

  const kickPlayer = (playerId: string) => {
    if (socket && room && isConnected) {
      socket.emit("kick-player", { roomId: room.id, playerId })
    }
  }

  const sendDrawingEvent = (event: any) => {
    if (socket && room && isConnected) {
      socket.emit("drawing-event", { roomId: room.id, event })
    }
  }

  const clearCanvas = () => {
    if (socket && room && isConnected) {
      socket.emit("clear-canvas", { roomId: room.id })
    }
  }

  return {
    socket,
    isConnected,
    room,
    chatMessages,
    error,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    sendChatMessage,
    kickPlayer,
    sendDrawingEvent,
    clearCanvas,
    setError,
  }
}