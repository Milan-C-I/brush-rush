import type { NextRequest } from "next/server"
import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import {
  selectRandomWord,
  calculateScore,
  generateHints,
  checkGuess,
  DEFAULT_GAME_SETTINGS,
  type GameSettings,
} from "@/lib/game-logic"

export const runtime = "nodejs"

interface Player {
  id: string
  name: string
  avatar: string
  score: number
  roundScore: number
  isDrawing: boolean
  socketId: string
  hasGuessedCorrectly: boolean
  guessCount: number
  correctGuesses: number
}

interface Room {
  id: string
  name: string
  players: Player[]
  currentDrawer: string | null
  currentWord: string | null
  currentCategory: string | null
  currentDifficulty: string | null
  basePoints: number
  gamePhase: "waiting" | "drawing" | "results" | "gameOver"
  timeLeft: number
  totalTime: number
  round: number
  maxRounds: number
  isPrivate: boolean
  password?: string
  drawingData: any[]
  settings: GameSettings
  roundStartTime: number
  hintRevealed: boolean[]
}

interface DrawingEvent {
  type: "start" | "draw" | "end"
  x: number
  y: number
  tool: "brush" | "eraser"
  color: string
  size: number
  opacity: number
}

const rooms = new Map<string, Room>()
const playerRooms = new Map<string, string>()
const roomTimers = new Map<string, NodeJS.Timeout>()

let io: SocketIOServer

export async function GET(req: NextRequest) {
  if (!io) {
    // @ts-ignore
    const httpServer: NetServer = req.socket?.server
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Player connected:", socket.id)

      // Join room
      socket.on("join-room", ({ roomId, player, password }) => {
        const room = rooms.get(roomId)

        if (!room) {
          socket.emit("error", { message: "Room not found" })
          return
        }

        if (room.isPrivate && room.password !== password) {
          socket.emit("error", { message: "Invalid password" })
          return
        }

        if (room.players.length >= 12) {
          socket.emit("error", { message: "Room is full" })
          return
        }

        // Add player to room
        const newPlayer: Player = {
          ...player,
          socketId: socket.id,
          score: 0,
          roundScore: 0,
          isDrawing: false,
          hasGuessedCorrectly: false,
          guessCount: 0,
          correctGuesses: 0,
        }

        room.players.push(newPlayer)
        playerRooms.set(socket.id, roomId)
        socket.join(roomId)

        // Notify all players in room
        io.to(roomId).emit("player-joined", {
          player: newPlayer,
          players: room.players,
        })

        // Send room state to new player
        socket.emit("room-joined", {
          room: {
            ...room,
            drawingData: room.drawingData,
          },
        })

        console.log(`Player ${player.name} joined room ${roomId}`)
      })

      // Create room
      socket.on("create-room", ({ roomData, player }) => {
        const roomId = generateRoomId()
        const newRoom: Room = {
          id: roomId,
          name: roomData.name,
          players: [],
          currentDrawer: null,
          currentWord: null,
          currentCategory: null,
          currentDifficulty: null,
          basePoints: 50,
          gamePhase: "waiting",
          timeLeft: DEFAULT_GAME_SETTINGS.roundTime,
          totalTime: DEFAULT_GAME_SETTINGS.roundTime,
          round: 0,
          maxRounds: roomData.maxRounds || DEFAULT_GAME_SETTINGS.maxRounds,
          isPrivate: roomData.isPrivate || false,
          password: roomData.password,
          drawingData: [],
          settings: { ...DEFAULT_GAME_SETTINGS, ...roomData.settings },
          roundStartTime: 0,
          hintRevealed: [],
        }

        rooms.set(roomId, newRoom)

        // Join the creator to the room
        const creator: Player = {
          ...player,
          socketId: socket.id,
          score: 0,
          roundScore: 0,
          isDrawing: false,
          hasGuessedCorrectly: false,
          guessCount: 0,
          correctGuesses: 0,
        }

        newRoom.players.push(creator)
        playerRooms.set(socket.id, roomId)
        socket.join(roomId)

        socket.emit("room-created", { roomId, room: newRoom })
        console.log(`Room ${roomId} created by ${player.name}`)
      })

      // Start game
      socket.on("start-game", () => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room || room.players.length < 2) return

        // Check if requester is host
        const requester = room.players.find((p) => p.socketId === socket.id)
        if (!requester || room.players[0].socketId !== socket.id) return

        // Start first round
        startNewRound(room, roomId)
        io.to(roomId).emit("game-started", { room })
      })

      // Drawing events
      socket.on("drawing-event", (drawingEvent: DrawingEvent) => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room) return

        // Only allow current drawer to draw
        const player = room.players.find((p) => p.socketId === socket.id)
        if (!player?.isDrawing || room.gamePhase !== "drawing") return

        // Store drawing data
        room.drawingData.push(drawingEvent)

        // Broadcast to other players
        socket.to(roomId).emit("drawing-event", drawingEvent)
      })

      // Clear canvas
      socket.on("clear-canvas", () => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room) return

        const player = room.players.find((p) => p.socketId === socket.id)
        if (!player?.isDrawing) return

        room.drawingData = []
        io.to(roomId).emit("canvas-cleared")
      })

      // Chat message
      socket.on("chat-message", ({ message }) => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room) return

        const player = room.players.find((p) => p.socketId === socket.id)
        if (!player) return

        const isGuess = room.gamePhase === "drawing" && !player.isDrawing && !player.hasGuessedCorrectly
        let isCorrect = false
        let similarity = 0

        if (isGuess && room.currentWord) {
          const guessResult = checkGuess(message, room.currentWord)
          isCorrect = guessResult.isCorrect
          similarity = guessResult.similarity

          player.guessCount++

          if (isCorrect) {
            player.hasGuessedCorrectly = true
            player.correctGuesses++

            const timeElapsed = room.totalTime - room.timeLeft
            const score = calculateScore(
              room.timeLeft,
              room.totalTime,
              room.basePoints,
              room.currentDifficulty || "medium",
              false,
            )

            player.score += score
            player.roundScore = score

            // Award points to drawer
            const drawer = room.players.find((p) => p.isDrawing)
            if (drawer) {
              const drawerScore = calculateScore(
                room.timeLeft,
                room.totalTime,
                room.basePoints,
                room.currentDifficulty || "medium",
                true,
              )
              drawer.score += drawerScore
              drawer.roundScore += drawerScore
            }

            io.to(roomId).emit("correct-guess", {
              player: player.name,
              word: room.currentWord,
              points: score,
              category: room.currentCategory,
            })

            // Check if all players have guessed correctly
            const nonDrawers = room.players.filter((p) => !p.isDrawing)
            const correctGuessers = nonDrawers.filter((p) => p.hasGuessedCorrectly)

            if (correctGuessers.length === nonDrawers.length) {
              endRound(room, roomId)
            }
          } else if (similarity > 70) {
            io.to(roomId).emit("close-guess", {
              player: player.name,
              guess: message,
              similarity,
            })
          }
        }

        const chatMessage = {
          id: Date.now(),
          player: player.name,
          message,
          type: isGuess ? "guess" : "chat",
          isCorrect,
          similarity,
          timestamp: Date.now(),
        }

        io.to(roomId).emit("chat-message", chatMessage)
      })

      // Kick player (host only)
      socket.on("kick-player", ({ playerId }) => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room) return

        // Check if requester is host (first player)
        const requester = room.players.find((p) => p.socketId === socket.id)
        if (!requester || room.players[0].socketId !== socket.id) return

        // Find and remove player
        const playerIndex = room.players.findIndex((p) => p.id === playerId)
        if (playerIndex === -1) return

        const kickedPlayer = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        playerRooms.delete(kickedPlayer.socketId)

        // Notify kicked player
        io.to(kickedPlayer.socketId).emit("kicked")

        // Notify room
        io.to(roomId).emit("player-left", {
          player: kickedPlayer,
          players: room.players,
        })
      })

      // Disconnect
      socket.on("disconnect", () => {
        const roomId = playerRooms.get(socket.id)
        if (!roomId) return

        const room = rooms.get(roomId)
        if (!room) return

        // Remove player from room
        const playerIndex = room.players.findIndex((p) => p.socketId === socket.id)
        if (playerIndex === -1) return

        const leftPlayer = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        playerRooms.delete(socket.id)

        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomId)
          const timer = roomTimers.get(roomId)
          if (timer) {
            clearInterval(timer)
            roomTimers.delete(roomId)
          }
        } else {
          // If the drawer left, end the round
          if (leftPlayer.isDrawing) {
            endRound(room, roomId)
          }

          // Notify remaining players
          io.to(roomId).emit("player-left", {
            player: leftPlayer,
            players: room.players,
          })
        }

        console.log(`Player ${leftPlayer.name} left room ${roomId}`)
      })
    })
  }

  return new Response("Socket.io server initialized", { status: 200 })
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function startNewRound(room: Room, roomId: string) {
  room.round++
  room.gamePhase = "drawing"
  room.drawingData = []
  room.roundStartTime = Date.now()

  room.players.forEach((p) => {
    p.isDrawing = false
    p.hasGuessedCorrectly = false
    p.roundScore = 0
  })

  // Select next drawer (rotate through players)
  const currentDrawerIndex = room.players.findIndex((p) => p.isDrawing)
  const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length
  room.players[nextDrawerIndex].isDrawing = true
  room.currentDrawer = room.players[nextDrawerIndex].id

  const wordData = selectRandomWord(room.settings)
  room.currentWord = wordData.word
  room.currentCategory = wordData.category
  room.currentDifficulty = wordData.difficulty
  room.basePoints = wordData.basePoints
  room.timeLeft = room.settings.roundTime
  room.totalTime = room.settings.roundTime
  room.hintRevealed = new Array(wordData.word.length).fill(false)

  const timer = setInterval(() => {
    room.timeLeft--

    // Generate hints based on time elapsed
    const timeElapsed = room.totalTime - room.timeLeft
    const newHints = generateHints(room.currentWord || "", room.settings.hintTimings, timeElapsed, room.totalTime)

    // Check if hints have changed
    const hintsChanged = newHints.some((hint, index) => hint !== room.hintRevealed[index])
    if (hintsChanged) {
      room.hintRevealed = newHints
      io.to(roomId).emit("hint-revealed", { hints: newHints })
    }

    // Broadcast time update
    io.to(roomId).emit("time-update", { timeLeft: room.timeLeft })

    if (room.timeLeft <= 0) {
      clearInterval(timer)
      roomTimers.delete(roomId)
      endRound(room, roomId)
    }
  }, 1000)

  roomTimers.set(roomId, timer)

  // Notify players about new round
  io.to(roomId).emit("round-started", {
    round: room.round,
    drawer: room.players[nextDrawerIndex].name,
    category: room.currentCategory,
    difficulty: room.currentDifficulty,
    timeLeft: room.timeLeft,
  })
}

function endRound(room: Room, roomId: string) {
  room.gamePhase = "results"

  // Clear timer
  const timer = roomTimers.get(roomId)
  if (timer) {
    clearInterval(timer)
    roomTimers.delete(roomId)
  }

  const roundResults = {
    word: room.currentWord,
    category: room.currentCategory,
    difficulty: room.currentDifficulty,
    drawer: room.players.find((p) => p.isDrawing)?.name,
    correctGuessers: room.players
      .filter((p) => p.hasGuessedCorrectly)
      .map((p) => ({
        name: p.name,
        score: p.roundScore,
      })),
    leaderboard: room.players
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        name: p.name,
        score: p.score,
        roundScore: p.roundScore,
      })),
  }

  io.to(roomId).emit("round-ended", roundResults)

  // Check if game is over
  if (room.round >= room.maxRounds) {
    room.gamePhase = "gameOver"

    const winner = room.players.reduce((prev, current) => (prev.score > current.score ? prev : current))

    const gameResults = {
      winner: winner.name,
      finalScores: room.players
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({
          rank: index + 1,
          name: p.name,
          totalScore: p.score,
          accuracy: p.guessCount > 0 ? Math.round((p.correctGuesses / p.guessCount) * 100) : 0,
          correctGuesses: p.correctGuesses,
          totalGuesses: p.guessCount,
        })),
    }

    io.to(roomId).emit("game-over", gameResults)

    // Reset room for new game
    setTimeout(() => {
      room.gamePhase = "waiting"
      room.round = 0
      room.players.forEach((p) => {
        p.score = 0
        p.roundScore = 0
        p.isDrawing = false
        p.hasGuessedCorrectly = false
        p.guessCount = 0
        p.correctGuesses = 0
      })
      io.to(roomId).emit("room-reset", { room })
    }, 10000) // 10 seconds to view results
  } else {
    // Start next round after 5 seconds
    setTimeout(() => {
      if (room.players.length >= 2) {
        startNewRound(room, roomId)
      }
    }, 5000)
  }
}
