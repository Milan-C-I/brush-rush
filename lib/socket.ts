"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager
  private connectionAttempts = 0
  private maxRetries = 5
  private isConnecting = false

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(): Socket {
    if (this.isConnecting) {
      console.log("[SocketManager] Connection already in progress, returning existing socket")
      return this.socket!
    }

    if (!this.socket || this.socket.disconnected) {
      this.isConnecting = true
      const socketUrl = `http://localhost:${process.env.NEXT_PUBLIC_SOCKET_PORT || 3001}`

      console.log("[SocketManager] Connecting to:", socketUrl)

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxRetries,
        forceNew: false,
        autoConnect: true,
      })

      this.socket.on("connect", () => {
        console.log("[SocketManager] Connected to server:", this.socket?.id)
        this.connectionAttempts = 0
        this.isConnecting = false
      })

      this.socket.on("disconnect", (reason) => {
        console.log("[SocketManager] Disconnected from server:", reason)
        this.isConnecting = false
      })

      this.socket.on("connect_error", (error) => {
        this.connectionAttempts++
        this.isConnecting = false
        console.error(`[SocketManager] Connection error (attempt ${this.connectionAttempts}):`, error.message)
        
        if (this.connectionAttempts >= this.maxRetries) {
          console.error("[SocketManager] Max connection attempts reached")
        }
      })

      this.socket.on("reconnect", (attempt) => {
        console.log(`[SocketManager] Reconnected after ${attempt} attempts`)
        this.connectionAttempts = 0
        this.isConnecting = false
      })

      this.socket.on("reconnect_error", (error) => {
        console.error("[SocketManager] Reconnection error:", error)
        this.isConnecting = false
      })

      this.socket.on("reconnect_failed", () => {
        console.error("[SocketManager] Failed to reconnect after maximum attempts")
        this.isConnecting = false
      })

      this.socket.on("error", (error) => {
        console.error("[SocketManager] Socket error:", error)
        this.isConnecting = false
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      console.log("[SocketManager] Manually disconnecting socket")
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false
  }

  reconnect() {
    this.isConnecting = false
    if (this.socket) {
      console.log("[SocketManager] Manually reconnecting socket")
      this.socket.connect()
    } else {
      this.connect()
    }
  }

  resetConnectionAttempts() {
    this.connectionAttempts = 0
  }
}

export default SocketManager