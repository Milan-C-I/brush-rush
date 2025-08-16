"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager
  private connectionAttempts = 0
  private maxRetries = 5
  private isConnecting = false
  private reconnectTimer: NodeJS.Timeout | null = null

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(): Socket {
    // If we already have a connected socket, return it
    if (this.socket && this.socket.connected) {
      console.log("[SocketManager] Using existing connected socket:", this.socket.id)
      return this.socket
    }

    // If connection is in progress, wait for it
    if (this.isConnecting && this.socket) {
      console.log("[SocketManager] Connection in progress, returning existing socket")
      return this.socket
    }

    // Clean up any existing socket before creating new one
    if (this.socket && !this.socket.connected) {
      console.log("[SocketManager] Cleaning up disconnected socket")
      this.socket.removeAllListeners()
      this.socket = null
    }

    this.isConnecting = true
    
    // Use environment variable or default to localhost:3001
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:${process.env.NEXT_PUBLIC_SOCKET_PORT || 3001}`

    console.log("[SocketManager] Creating new connection to:", socketUrl)

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxRetries,
      forceNew: false,
      autoConnect: true,
      // Add these options for better reliability
      upgrade: true,
      rememberUpgrade: true,
    })

    this.setupEventListeners()
    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("[SocketManager] Connected to server:", this.socket?.id)
      this.connectionAttempts = 0
      this.isConnecting = false
      
      // Clear any reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    })

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketManager] Disconnected from server:", reason)
      this.isConnecting = false

      // Don't auto-reconnect for certain reasons
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        console.log("[SocketManager] Manual disconnect, not attempting reconnection")
        return
      }

      // Auto-reconnect for network issues
      if (reason === "transport close" || reason === "ping timeout") {
        console.log("[SocketManager] Network issue detected, will attempt reconnection")
      }
    })

    this.socket.on("connect_error", (error) => {
      this.connectionAttempts++
      this.isConnecting = false
      
      console.error(`[SocketManager] Connection error (attempt ${this.connectionAttempts}/${this.maxRetries}):`, error.message)
        
      if (this.connectionAttempts >= this.maxRetries) {
        console.error("[SocketManager] Max connection attempts reached")
        // Optionally emit a custom event for the UI to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('socket-connection-failed', { 
            detail: { error: error.message, attempts: this.connectionAttempts } 
          }))
        }
      } else {
        // Schedule manual reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 10000)
        console.log(`[SocketManager] Scheduling reconnect in ${delay}ms`)
        
        this.reconnectTimer = setTimeout(() => {
          if (!this.socket?.connected && this.connectionAttempts < this.maxRetries) {
            console.log("[SocketManager] Attempting manual reconnect...")
            this.reconnect()
          }
        }, delay)
      }
    })

    this.socket.on("reconnect", (attempt) => {
      console.log(`[SocketManager] Reconnected after ${attempt} attempts`)
      this.connectionAttempts = 0
      this.isConnecting = false
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("[SocketManager] Reconnection error:", error.message)
      this.isConnecting = false
    })

    this.socket.on("reconnect_failed", () => {
      console.error("[SocketManager] Failed to reconnect after maximum attempts")
      this.isConnecting = false
      
      // Emit custom event for UI handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('socket-reconnect-failed'))
      }
    })

    this.socket.on("error", (error) => {
      console.error("[SocketManager] Socket error:", error)
      this.isConnecting = false
    })

    // Add connection timeout handling
    const connectionTimeout = setTimeout(() => {
      if (this.isConnecting && this.socket && !this.socket.connected) {
        console.error("[SocketManager] Connection timeout")
        this.isConnecting = false
        
        // Force disconnect and retry
        this.socket.disconnect()
        if (this.connectionAttempts < this.maxRetries) {
          setTimeout(() => this.connect(), 2000)
        }
      }
    }, 15000) // 15 second timeout

    this.socket.on("connect", () => {
      clearTimeout(connectionTimeout)
    })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      console.log("[SocketManager] Manually disconnecting socket")
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
      this.connectionAttempts = 0
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false
  }

  reconnect() {
    console.log("[SocketManager] Manual reconnect requested")
    
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.isConnecting = false
    
    if (this.socket) {
      if (this.socket.connected) {
        console.log("[SocketManager] Socket already connected")
        return
      }
      
      // Try to reconnect existing socket first
      console.log("[SocketManager] Attempting to reconnect existing socket")
      this.socket.connect()
    } else {
      // Create new connection
      console.log("[SocketManager] Creating new connection")
      this.connect()
    }
  }

  resetConnectionAttempts() {
    this.connectionAttempts = 0
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // Method to force a fresh connection
  forceReconnect() {
    console.log("[SocketManager] Forcing fresh connection")
    this.disconnect()
    setTimeout(() => {
      this.connect()
    }, 1000)
  }

  // Get connection status details
  getConnectionStatus() {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      connectionAttempts: this.connectionAttempts,
      socketId: this.socket?.id || null,
      maxRetries: this.maxRetries,
    }
  }
}

export default SocketManager