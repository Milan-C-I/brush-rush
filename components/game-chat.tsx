"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ChatMessage {
  id: number
  player: string
  message: string
  type: "chat" | "guess" | "system"
  isCorrect?: boolean
  timestamp: number
}

interface GameChatProps {
  messages: ChatMessage[]
  currentPlayer: string
  isDrawer: boolean
}

export function GameChat({ messages, currentPlayer, isDrawer }: GameChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex-1 flex flex-col overflow-clip">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-gray-300">Game Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message,index) => (
          <div key={index} className="flex gap-3">
            <Avatar className="w-6 h-6 mt-1">
              <AvatarFallback className="bg-slate-600 text-xs">{message.player.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-300">{message.player}</span>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                {message.type === "guess" && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      message.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {message.isCorrect ? "Correct!" : "Wrong"}
                  </Badge>
                )}
              </div>

              <div
                className={`text-sm p-2 rounded-lg ${
                  message.type === "guess"
                    ? message.isCorrect
                      ? "bg-green-500/10 text-green-300 border border-green-500/20"
                      : "bg-red-500/10 text-red-300 border border-red-500/20"
                    : "bg-slate-600/30 text-gray-200"
                }`}
              >
                {message.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
