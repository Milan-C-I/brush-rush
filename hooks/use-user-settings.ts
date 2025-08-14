"use client"

import { useState, useEffect } from "react"
import type { GameStats } from "@/lib/game-logic"

export interface UserSettings {
  profile: {
    displayName: string
    avatar: string
    bio: string
  }
  hotkeys: {
    undo: string
    redo: string
    brush: string
    eraser: string
    clear: string
    colorPicker: string
    settings: string
  }
  drawing: {
    defaultBrushSize: number
    brushSensitivity: number
    pressureSensitivity: number
    smoothing: number
    autoSave: boolean
    showGuides: boolean
    enablePressure: boolean
  }
  audio: {
    masterVolume: number
    sfxVolume: number
    drawingSounds: boolean
    chatSounds: boolean
  }
  ui: {
    showFPS: boolean
    compactChat: boolean
    showTooltips: boolean
    animations: boolean
    scale: number
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    displayName: "Player",
    avatar: "🎨",
    bio: "",
  },
  hotkeys: {
    undo: "Ctrl+Z",
    redo: "Ctrl+Y",
    brush: "B",
    eraser: "E",
    clear: "Ctrl+Delete",
    colorPicker: "C",
    settings: "Ctrl+,",
  },
  drawing: {
    defaultBrushSize: 5,
    brushSensitivity: 100,
    pressureSensitivity: 50,
    smoothing: 20,
    autoSave: true,
    showGuides: false,
    enablePressure: true,
  },
  audio: {
    masterVolume: 70,
    sfxVolume: 50,
    drawingSounds: true,
    chatSounds: true,
  },
  ui: {
    showFPS: false,
    compactChat: false,
    showTooltips: true,
    animations: true,
    scale: 100,
  },
}

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  totalWins: 0,
  totalPoints: 0,
  averageScore: 0,
  bestScore: 0,
  favoriteCategory: "Animals",
  correctGuesses: 0,
  totalGuesses: 0,
  guessAccuracy: 0,
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [userStats, setUserStats] = useState<GameStats>(DEFAULT_STATS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("drawtogether_settings")
      const savedStats = localStorage.getItem("drawtogether_stats")

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }

      if (savedStats) {
        const parsed = JSON.parse(savedStats)
        setUserStats({ ...DEFAULT_STATS, ...parsed })
      }
    } catch (error) {
      console.error("Failed to load user settings:", error)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("drawtogether_settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save user settings:", error)
    }
  }, [settings])

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("drawtogether_stats", JSON.stringify(userStats))
    } catch (error) {
      console.error("Failed to save user stats:", error)
    }
  }, [userStats])

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev }

      // Deep merge for nested objects
      Object.keys(newSettings).forEach((key) => {
        if (
          typeof newSettings[key as keyof UserSettings] === "object" &&
          newSettings[key as keyof UserSettings] !== null
        ) {
          updated[key as keyof UserSettings] = {
            ...updated[key as keyof UserSettings],
            ...newSettings[key as keyof UserSettings],
          } as any
        } else {
          updated[key as keyof UserSettings] = newSettings[key as keyof UserSettings] as any
        }
      })

      return updated
    })
  }

  const updateStats = (newStats: Partial<GameStats>) => {
    setUserStats((prev) => ({ ...prev, ...newStats }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem("drawtogether_settings")
  }

  const resetStats = () => {
    setUserStats(DEFAULT_STATS)
    localStorage.removeItem("drawtogether_stats")
  }

  // Hotkey handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      // Build key combination string
      let combination = ""
      if (ctrl) combination += "Ctrl+"
      if (shift) combination += "Shift+"
      if (alt) combination += "Alt+"
      combination += key

      // Check if this matches any hotkey
      Object.entries(settings.hotkeys).forEach(([action, hotkey]) => {
        if (hotkey.toLowerCase() === combination.toLowerCase()) {
          event.preventDefault()

          // Dispatch custom event for hotkey actions
          window.dispatchEvent(new CustomEvent(`hotkey:${action}`))
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [settings.hotkeys])

  return {
    settings,
    userStats,
    updateSettings,
    updateStats,
    resetSettings,
    resetStats,
  }
}
