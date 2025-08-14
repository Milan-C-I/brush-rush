"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Keyboard,
  Palette,
  Volume2,
  Monitor,
  Save,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useUserSettings } from "@/hooks/use-user-settings"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, userStats } = useUserSettings()
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleSave = () => {
    // Settings are automatically saved via the hook
    setHasChanges(false)
  }

  const handleReset = () => {
    resetSettings()
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset} size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} size="sm" disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Drawing
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio & UI
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Display Name</Label>
                    <Input
                      value={settings.profile.displayName}
                      onChange={(e) =>
                        handleSettingChange("profile", { ...settings.profile, displayName: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Preferred Avatar</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {["🎨", "✏️", "🖌️", "🎭", "🌟", "💫"].map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleSettingChange("profile", { ...settings.profile, avatar: emoji })}
                          className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl hover:bg-slate-600 transition-colors ${
                            settings.profile.avatar === emoji ? "ring-2 ring-blue-400" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Bio</Label>
                  <textarea
                    value={settings.profile.bio}
                    onChange={(e) => handleSettingChange("profile", { ...settings.profile, bio: e.target.value })}
                    className="w-full mt-2 p-3 bg-slate-700/50 border border-slate-600 rounded text-white resize-none"
                    rows={3}
                    maxLength={150}
                    placeholder="Tell others about yourself..."
                  />
                  <div className="text-xs text-gray-400 mt-1">{settings.profile.bio.length}/150 characters</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Settings */}
          <TabsContent value="controls" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-green-400" />
                  Hotkey Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.hotkeys).map(([action, key]) => (
                  <div key={action} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300 capitalize">{action.replace(/([A-Z])/g, " $1")}</span>
                    <div className="flex items-center gap-2">
                      <kbd className="px-3 py-1 bg-slate-600 rounded text-sm font-mono">{key}</kbd>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Simple hotkey change - in real app would use a key capture modal
                          const newKey = prompt(`Enter new key for ${action}:`, key)
                          if (newKey) {
                            handleSettingChange("hotkeys", { ...settings.hotkeys, [action]: newKey })
                          }
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drawing Settings */}
          <TabsContent value="drawing" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Drawing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Default Brush Size: {settings.drawing.defaultBrushSize}px</Label>
                    <Slider
                      value={[settings.drawing.defaultBrushSize]}
                      onValueChange={(value) =>
                        handleSettingChange("drawing", { ...settings.drawing, defaultBrushSize: value[0] })
                      }
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Brush Sensitivity: {settings.drawing.brushSensitivity}%</Label>
                    <Slider
                      value={[settings.drawing.brushSensitivity]}
                      onValueChange={(value) =>
                        handleSettingChange("drawing", { ...settings.drawing, brushSensitivity: value[0] })
                      }
                      max={200}
                      min={50}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Pressure Sensitivity: {settings.drawing.pressureSensitivity}%
                    </Label>
                    <Slider
                      value={[settings.drawing.pressureSensitivity]}
                      onValueChange={(value) =>
                        handleSettingChange("drawing", { ...settings.drawing, pressureSensitivity: value[0] })
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Smoothing: {settings.drawing.smoothing}%</Label>
                    <Slider
                      value={[settings.drawing.smoothing]}
                      onValueChange={(value) =>
                        handleSettingChange("drawing", { ...settings.drawing, smoothing: value[0] })
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Auto-save drawings</Label>
                    <Switch
                      checked={settings.drawing.autoSave}
                      onCheckedChange={(checked) =>
                        handleSettingChange("drawing", { ...settings.drawing, autoSave: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Show drawing guides</Label>
                    <Switch
                      checked={settings.drawing.showGuides}
                      onCheckedChange={(checked) =>
                        handleSettingChange("drawing", { ...settings.drawing, showGuides: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Enable pressure sensitivity</Label>
                    <Switch
                      checked={settings.drawing.enablePressure}
                      onCheckedChange={(checked) =>
                        handleSettingChange("drawing", { ...settings.drawing, enablePressure: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio & UI Settings */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-red-400" />
                    Audio Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Master Volume: {settings.audio.masterVolume}%</Label>
                    <Slider
                      value={[settings.audio.masterVolume]}
                      onValueChange={(value) =>
                        handleSettingChange("audio", { ...settings.audio, masterVolume: value[0] })
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Sound Effects: {settings.audio.sfxVolume}%</Label>
                    <Slider
                      value={[settings.audio.sfxVolume]}
                      onValueChange={(value) =>
                        handleSettingChange("audio", { ...settings.audio, sfxVolume: value[0] })
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Drawing sounds</Label>
                      <Switch
                        checked={settings.audio.drawingSounds}
                        onCheckedChange={(checked) =>
                          handleSettingChange("audio", { ...settings.audio, drawingSounds: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Chat notifications</Label>
                      <Switch
                        checked={settings.audio.chatSounds}
                        onCheckedChange={(checked) =>
                          handleSettingChange("audio", { ...settings.audio, chatSounds: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    Interface Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Show FPS counter</Label>
                      <Switch
                        checked={settings.ui.showFPS}
                        onCheckedChange={(checked) => handleSettingChange("ui", { ...settings.ui, showFPS: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Compact chat</Label>
                      <Switch
                        checked={settings.ui.compactChat}
                        onCheckedChange={(checked) =>
                          handleSettingChange("ui", { ...settings.ui, compactChat: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Show tooltips</Label>
                      <Switch
                        checked={settings.ui.showTooltips}
                        onCheckedChange={(checked) =>
                          handleSettingChange("ui", { ...settings.ui, showTooltips: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Animations</Label>
                      <Switch
                        checked={settings.ui.animations}
                        onCheckedChange={(checked) =>
                          handleSettingChange("ui", { ...settings.ui, animations: checked })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">UI Scale: {settings.ui.scale}%</Label>
                    <Slider
                      value={[settings.ui.scale]}
                      onValueChange={(value) => handleSettingChange("ui", { ...settings.ui, scale: value[0] })}
                      max={150}
                      min={75}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{userStats.totalGames}</div>
                      <div className="text-sm text-gray-400">Games Played</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{userStats.guessAccuracy}%</div>
                      <div className="text-sm text-gray-400">Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{userStats.bestScore}</div>
                      <div className="text-sm text-gray-400">Best Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{userStats.averageScore}</div>
                      <div className="text-sm text-gray-400">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Points</span>
                      <span className="text-white font-medium">{userStats.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Games Won</span>
                      <span className="text-white font-medium">{userStats.totalWins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Win Rate</span>
                      <span className="text-white font-medium">
                        {userStats.totalGames > 0 ? Math.round((userStats.totalWins / userStats.totalGames) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Correct Guesses</span>
                      <span className="text-white font-medium">{userStats.correctGuesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Guesses</span>
                      <span className="text-white font-medium">{userStats.totalGuesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Favorite Category</span>
                      <span className="text-white font-medium">{userStats.favoriteCategory}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
