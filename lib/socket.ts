"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
      })

      this.socket.on("connect", () => {
        console.log("Connected to server:", this.socket?.id)
      })

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server")
      })

      this.socket.on("error", (error) => {
        console.error("Socket error:", error)
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export default SocketManager
