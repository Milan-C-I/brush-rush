"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { X, Keyboard, Mouse } from "lucide-react"

interface BrushSettingsProps {
  onClose: () => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushOpacity: number
  setBrushOpacity: (opacity: number) => void
}

export function BrushSettings({ onClose, brushSize, setBrushSize, brushOpacity, setBrushOpacity }: BrushSettingsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Drawing Settings</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Brush Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Mouse className="w-4 h-4" />
              Brush Settings
            </h4>

            <div>
              <Label className="text-xs text-gray-400">Brush Size: {brushSize}px</Label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Opacity: {brushOpacity}%</Label>
              <Slider
                value={[brushOpacity]}
                onValueChange={(value) => setBrushOpacity(value[0])}
                max={100}
                min={10}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          {/* Hotkey Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Hotkeys
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-gray-300">Undo</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-gray-200">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-gray-300">Redo</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-gray-200">Ctrl+Y</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-gray-300">Brush Tool</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-gray-200">B</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-gray-300">Eraser Tool</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-gray-200">E</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-gray-300">Clear Canvas</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-gray-200">Ctrl+Del</kbd>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
