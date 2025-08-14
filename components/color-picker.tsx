"use client"

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const colors = [
    "#000000",
    "#ffffff",
    "#ff4757",
    "#2ed573",
    "#3742fa",
    "#ffa502",
    "#ff6b81",
    "#70a1ff",
    "#5352ed",
    "#ff9ff3",
    "#54a0ff",
    "#26de81",
    "#a4b0be",
    "#778ca3",
    "#4b4b4b",
    "#57606f",
    "#2f3542",
    "#f1f2f6",
  ]

  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-2">Brush Color</label>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
              selectedColor === color ? "border-white ring-2 ring-blue-400" : "border-gray-600 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
        />
        <span className="text-xs text-gray-400 font-mono">{selectedColor}</span>
      </div>
    </div>
  )
}
