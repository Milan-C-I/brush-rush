"use client"

import { useEffect, useState, useCallback } from "react"
import type { Socket } from "socket.io-client"
import SocketManager from "@/lib/socket"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(() => {
    try {
      const socketManager = SocketManager.getInstance()
      const socketInstance = socketManager.connect()
      setSocket(socketInstance)
      setIsConnecting(true)
      setConnectionError(null)
    } catch (error) {
      console.error("[useSocket] Failed to connect:", error)
      setConnectionError(error instanceof Error ? error.message : "Failed to connect")
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    const socketManager = SocketManager.getInstance()
    socketManager.disconnect()
    setSocket(null)
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  const reconnect = useCallback(() => {
    console.log("[useSocket] Manual reconnect requested")
    setConnectionError(null)
    const socketManager = SocketManager.getInstance()
    socketManager.reconnect()
  }, [])

  const forceReconnect = useCallback(() => {
    console.log("[useSocket] Force reconnect requested")
    setConnectionError(null)
    const socketManager = SocketManager.getInstance()
    socketManager.forceReconnect()
  }, [])

  useEffect(() => {
    connect()

    // Listen for custom socket events
    const handleConnectionFailed = (event: CustomEvent) => {
      console.error("[useSocket] Connection failed:", event.detail)
      setConnectionError(`Connection failed after ${event.detail.attempts} attempts`)
      setIsConnecting(false)
      setIsConnected(false)
    }

    const handleReconnectFailed = () => {
      console.error("[useSocket] Reconnection failed")
      setConnectionError("Failed to reconnect to server")
      setIsConnecting(false)
      setIsConnected(false)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('socket-connection-failed', handleConnectionFailed as EventListener)
      window.addEventListener('socket-reconnect-failed', handleReconnectFailed)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('socket-connection-failed', handleConnectionFailed as EventListener)
        window.removeEventListener('socket-reconnect-failed', handleReconnectFailed)
      }
    }
  }, [connect])

  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      console.log("[useSocket] Socket connected:", socket.id)
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionError(null)
    }

    const onDisconnect = (reason: string) => {
      console.log("[useSocket] Socket disconnected:", reason)
      setIsConnected(false)
      setIsConnecting(false)
      
      // Set appropriate error message based on disconnect reason
      if (reason === "io server disconnect") {
        setConnectionError("Server disconnected")
      } else if (reason === "ping timeout") {
        setConnectionError("Connection timeout")
      } else if (reason === "transport close") {
        setConnectionError("Network connection lost")
      }
    }

    const onConnecting = () => {
      console.log("[useSocket] Socket connecting...")
      setIsConnecting(true)
      setConnectionError(null)
    }

    const onConnectError = (error: Error) => {
      console.error("[useSocket] Socket connection error:", error.message)
      setIsConnecting(false)
      setConnectionError(error.message)
    }

    const onReconnect = (attempt: number) => {
      console.log("[useSocket] Socket reconnected after", attempt, "attempts")
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionError(null)
    }

    const onReconnectAttempt = (attempt: number) => {
      console.log("[useSocket] Reconnect attempt", attempt)
      setIsConnecting(true)
      setConnectionError(null)
    }

    const onReconnectError = (error: Error) => {
      console.error("[useSocket] Reconnect error:", error.message)
      setIsConnecting(false)
      setConnectionError(`Reconnect failed: ${error.message}`)
    }

    const onReconnectFailed = () => {
      console.error("[useSocket] Reconnect failed")
      setIsConnecting(false)
      setConnectionError("Failed to reconnect to server")
    }

    // Register all event listeners
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connecting", onConnecting)
    socket.on("connect_error", onConnectError)
    socket.on("reconnect", onReconnect)
    socket.on("reconnect_attempt", onReconnectAttempt)
    socket.on("reconnect_error", onReconnectError)
    socket.on("reconnect_failed", onReconnectFailed)

    // Set initial connection state
    if (socket.connected) {
      setIsConnected(true)
      setIsConnecting(false)
    } else if (socket.connected) {
      setIsConnecting(true)
    }

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connecting", onConnecting)
      socket.off("connect_error", onConnectError)
      socket.off("reconnect", onReconnect)
      socket.off("reconnect_attempt", onReconnectAttempt)
      socket.off("reconnect_error", onReconnectError)
      socket.off("reconnect_failed", onReconnectFailed)
    }
  }, [socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount in development to prevent connection issues
      if (process.env.NODE_ENV === 'production') {
        disconnect()
      }
    }
  }, [])

  return {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    reconnect,
    forceReconnect,
  }
}