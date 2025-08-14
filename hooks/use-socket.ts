"use client"

import { useEffect, useState } from "react"
import type { Socket } from "socket.io-client"
import SocketManager from "@/lib/socket"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketManager = SocketManager.getInstance()
    const socketInstance = socketManager.connect()

    setSocket(socketInstance)

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socketInstance.on("connect", onConnect)
    socketInstance.on("disconnect", onDisconnect)

    return () => {
      socketInstance.off("connect", onConnect)
      socketInstance.off("disconnect", onDisconnect)
    }
  }, [])

  return { socket, isConnected }
}
