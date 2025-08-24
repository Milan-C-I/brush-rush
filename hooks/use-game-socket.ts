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

  const createRoom = useCallback(
    (roomData: any, player: any) => {
      if (socket && isConnected && !isLoading) {
        console.log("[GameSocket] Creating room with data:", roomData, "player:", player)
        setIsLoading(true)
        setError(null)
        socket.emit("create-room", { roomData, player })
      } else {
        console.log(
          "[GameSocket] Cannot create room - socket:",
          !!socket,
          "loading:",
          isLoading,
          "connected:",
          isConnected,
        )
        if (!isConnected) {
          setError("Not connected to server. Please wait and try again.")
        }
      }
    },
    [socket, isLoading, isConnected],
  )

  const updateRoom = useCallback(
    (roomData: any) => {
      if (socket && isConnected && room) {
        console.log("[GameSocket] Updating room settings:", roomData)
        setIsLoading(true)
        setError(null)
        socket.emit("update-room", roomData)
      } else {
        console.log("[GameSocket] Cannot update room - not connected or no room")
        if (!isConnected) {
          setError("Not connected to server. Please wait and try again.")
        }
      }
    },
    [socket, isConnected, room],
  )

  const restartGame = useCallback(
    (roomData?: any) => {
      if (socket && isConnected && room) {
        console.log("[GameSocket] Restarting game with settings:", roomData)
        setIsLoading(true)
        setError(null)
        socket.emit("restart-game", { roomId: room.id, roomData })
      } else {
        console.log("[GameSocket] Cannot restart game - not connected or no room")
        if (!isConnected) {
          setError("Not connected to server. Please wait and try again.")
        }
      }
    },
    [socket, isConnected, room],
  )

  const joinRoomFromHomepage = useCallback(
    (roomId: string, player: any, password?: string) => {
      if (!isConnected) {
        setError("Not connected to server. Please wait and try again.")
        return
      }

      // For homepage joins, we navigate to the game page with parameters
      // The actual socket join will happen in the game page
      const params = new URLSearchParams({
        roomId,
        playerName: player.name,
        playerAvatar: player.avatar,
      })

      if (password) {
        params.append("password", password)
      }

      router.push(`/game?${params.toString()}`)
    },
    [isConnected, router],
  )

  const joinRoomInGame = useCallback(
    (roomId: string, player: any, password?: string) => {
      if (socket && isConnected && !isLoading) {
        console.log("[GameSocket] Attempting to join room:", roomId, "with player:", player)
        setIsLoading(true)
        setError(null)
        socket.emit("join-room", { roomId, player, password })
      } else {
        console.log(
          "[GameSocket] Cannot join room - socket:",
          !!socket,
          "loading:",
          isLoading,
          "connected:",
          isConnected,
        )
        if (!isConnected) {
          setError("Not connected to server. Please wait and try again.")
        }
      }
    },
    [socket, isLoading, isConnected],
  )

  useEffect(() => {
    if (!socket) return

    console.log("[GameSocket] Setting up socket listeners")

    // Room events
    const handleRoomCreated = ({ roomId, room }: { roomId: string; room: Room }) => {
      console.log("[GameSocket] Room created successfully:", roomId, room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
      // Navigate to the game page after successful room creation
      router.push(`/game?roomId=${roomId}&playerName=${room.players[0].name}&playerAvatar=${room.players[0].avatar}`)
    }

    const handleRoomUpdated = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Room settings updated:", room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          player: "System",
          message: "Room settings have been updated by the host",
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }

    const handleGameRestarted = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Game restarted:", room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
      setChatMessages([{
        id: Date.now(),
        player: "System",
        message: "🎮 Game has been restarted! Get ready for a new round!",
        type: "system",
        timestamp: Date.now(),
      }])
    }

    const handleRoomJoined = ({ room }: { room: Room }) => {
      console.log("[GameSocket] Room joined successfully:", room)
      setRoom(room)
      setError(null)
      setIsLoading(false)
    }

    const handlePlayerJoined = ({ player, players }: { player: Player; players: Player[] }) => {
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

    const handlePlayerLeft = ({ player, players }: { player: Player; players: Player[] }) => {
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

    const handleRoundStarted = ({ room, word, drawer }: { room: Room; word: string; drawer: Player }) => {
      console.log("[GameSocket] Round started:", { room, word, drawer })
      setRoom(room)
      
      // Clear canvas for all players at the start of each round
      window.dispatchEvent(new CustomEvent('clear-canvas-new-round'))
    }

    const handleTimerUpdate = ({ timeLeft }: { timeLeft: number }) => {
      setRoom((prev) => (prev ? { ...prev, timeLeft } : null))
    }

    // Chat events
    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message])
    }

    const handleCorrectGuess = ({ player, word, points }: { player: string; word: string; points: number }) => {
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

    // Drawing events - using custom events for canvas communication
    const handleDrawingEvent = (event: any) => {
      console.log("[GameSocket] Drawing event received:", event.type)
      // Dispatch custom event that the canvas can listen to
      window.dispatchEvent(new CustomEvent('remote-drawing-event', { detail: event }))
    }

    const handleCanvasCleared = () => {
      console.log("[GameSocket] Canvas cleared by remote user")
      // Dispatch custom event for canvas clearing
      window.dispatchEvent(new CustomEvent('remote-canvas-cleared'))
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
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          player: "System",
          message: "🎉 Game finished! Check out the final scores!",
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }

    // Register all event listeners
    socket.on("room-created", handleRoomCreated)
    socket.on("room-updated", handleRoomUpdated)
    socket.on("game-restarted", handleGameRestarted)
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
      socket.off("room-updated", handleRoomUpdated)
      socket.off("game-restarted", handleGameRestarted)
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
    updateRoom,
    restartGame,
    joinRoom: joinRoomFromHomepage, // For homepage usage
    joinRoomInGame, // For game page usage
    startGame,
    sendChatMessage,
    kickPlayer,
    sendDrawingEvent,
    clearCanvas,
    setError,
  }
}