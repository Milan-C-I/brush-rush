"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Smile, Flag, VolumeX, Copy, Reply } from "lucide-react"

interface ChatMessage {
  id: number
  player: string
  message: string
  type: "chat" | "guess" | "system" | "correct" | "close"
  isCorrect?: boolean
  similarity?: number
  timestamp: number
  avatar?: string
  isHost?: boolean
  isMuted?: boolean
}

interface EnhancedChatProps {
  messages: ChatMessage[]
  currentPlayer: string
  isDrawer: boolean
  onSendMessage: (message: string) => void
  onMutePlayer?: (playerId: string) => void
  onReportPlayer?: (playerId: string, reason: string) => void
  isMuted?: boolean
}

export function EnhancedChat({
  messages,
  currentPlayer,
  isDrawer,
  onSendMessage,
  onMutePlayer,
  onReportPlayer,
  isMuted = false,
}: EnhancedChatProps) {
  const [message, setMessage] = useState("")
  const [showEmojis, setShowEmojis] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const emojis = ["😀", "😂", "😍", "🤔", "😮", "👍", "👎", "❤️", "🎉", "🔥", "💯", "👏"]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSendMessage = () => {
    if (message.trim() && !isMuted) {
      let finalMessage = message
      if (replyTo) {
        finalMessage = `@${replyTo} ${message}`
        setReplyTo(null)
      }
      onSendMessage(finalMessage)
      setMessage("")
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojis(false)
  }

  const getMessageStyle = (msg: ChatMessage) => {
    switch (msg.type) {
      case "system":
        return "bg-blue-500/10 text-blue-300 border border-blue-500/20"
      case "correct":
        return "bg-green-500/10 text-green-300 border border-green-500/20"
      case "close":
        return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
      case "guess":
        return msg.isCorrect
          ? "bg-green-500/10 text-green-300 border border-green-500/20"
          : msg.similarity && msg.similarity > 70
            ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
            : "bg-red-500/10 text-red-300 border border-red-500/20"
      default:
        return "bg-slate-600/30 text-gray-200"
    }
  }

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-gray-300 flex items-center justify-between">
          Game Chat
          <Badge variant="secondary" className="bg-slate-600/50 text-gray-300">
            {messages.length} messages
          </Badge>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="group relative">
            <div className="flex gap-3">
              <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-slate-600 text-xs">{msg.avatar || msg.player.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-300 flex items-center gap-1">
                    {msg.player}
                    {msg.isHost && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs px-1">
                        Host
                      </Badge>
                    )}
                    {msg.isMuted && <VolumeX className="w-3 h-3 text-red-400" />}
                  </span>
                  <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>

                  {msg.type === "guess" && msg.similarity && (
                    <Badge variant="secondary" className="text-xs">
                      {msg.similarity}% match
                    </Badge>
                  )}
                </div>

                <div className={`text-sm p-2 rounded-lg ${getMessageStyle(msg)}`}>
                  {msg.message}

                  {msg.type === "correct" && (
                    <div className="mt-1 text-xs opacity-75">
                      🎉 Correct guess! +{Math.floor(Math.random() * 50 + 50)} points
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyMessage(msg.message)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>

                  {msg.player !== currentPlayer && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        onClick={() => setReplyTo(msg.player)}
                      >
                        <Reply className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                        onClick={() => onReportPlayer?.(msg.player, "inappropriate")}
                      >
                        <Flag className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {(!isDrawer || true) && ( // Allow chat for everyone, not just guessers
        <div className="p-4 border-t border-slate-700/50">
          {replyTo && (
            <div className="mb-2 p-2 bg-slate-700/30 rounded text-sm text-gray-300 flex items-center justify-between">
              <span>Replying to @{replyTo}</span>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setReplyTo(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={
                  isMuted ? "You are muted" : isDrawer ? "Chat with other players..." : "Type your guess or chat..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                disabled={isMuted}
                maxLength={200}
              />

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowEmojis(!showEmojis)}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!message.trim() || isMuted}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="absolute bottom-16 right-4 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Character Count */}
          <div className="text-xs text-gray-500 mt-1 text-right">{message.length}/200</div>
        </div>
      )}
    </div>
  )
}
