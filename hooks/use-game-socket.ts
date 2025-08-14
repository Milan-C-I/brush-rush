"use client"

import { useEffect, useState } from "react"
import { useSocket } from "./use-socket"

interface Player {
  id: string
  name: string
  avatar: string
  score: number
  isDrawing: boolean
  socketId: string
}

interface Room {
  id: string
  name: string
  players: Player[]
  currentDrawer: string | null
  currentWord: string | null
  gamePhase: "waiting" | "drawing" | "guessing" | "results"
  timeLeft: number
  round: number
  maxRounds: number
  drawingData: any[]
}

interface ChatMessage {
  id: number
  player: string
  message: string
  type: "chat" | "guess" | "system"
  isCorrect?: boolean
  timestamp: number
}

export function useGameSocket() {
  const { socket, isConnected } = useSocket()
  const [room, setRoom] = useState<Room | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!socket) return

    // Room events
    socket.on("room-created", ({ roomId, room }) => {
      setRoom(room)
      setError(null)
    })

    socket.on("room-joined", ({ room }) => {
      setRoom(room)
      setError(null)
    })

    socket.on("player-joined", ({ player, players }) => {
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
    })

    socket.on("player-left", ({ player, players }) => {
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
    })

    socket.on("game-started", ({ room }) => {
      setRoom(room)
    })

    // Chat events
    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message])
    })

    socket.on("correct-guess", ({ player, word, points }) => {
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
    })

    // Error handling
    socket.on("error", ({ message }) => {
      setError(message)
    })

    socket.on("kicked", () => {
      setError("You have been kicked from the room")
      setRoom(null)
    })

    return () => {
      socket.off("room-created")
      socket.off("room-joined")
      socket.off("player-joined")
      socket.off("player-left")
      socket.off("game-started")
      socket.off("chat-message")
      socket.off("correct-guess")
      socket.off("error")
      socket.off("kicked")
    }
  }, [socket])

  const createRoom = (roomData: any, player: any) => {
    if (socket) {
      socket.emit("create-room", { roomData, player })
    }
  }

  const joinRoom = (roomId: string, player: any, password?: string) => {
    if (socket) {
      socket.emit("join-room", { roomId, player, password })
    }
  }

  const startGame = () => {
    if (socket) {
      socket.emit("start-game")
    }
  }

  const sendChatMessage = (message: string) => {
    if (socket) {
      socket.emit("chat-message", { message })
    }
  }

  const kickPlayer = (playerId: string) => {
    if (socket) {
      socket.emit("kick-player", { playerId })
    }
  }

  const sendDrawingEvent = (drawingEvent: any) => {
    if (socket) {
      socket.emit("drawing-event", drawingEvent)
    }
  }

  const clearCanvas = () => {
    if (socket) {
      socket.emit("clear-canvas")
    }
  }

  return {
    socket,
    isConnected,
    room,
    chatMessages,
    error,
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
