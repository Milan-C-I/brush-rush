"use client"

import type React from "react"
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"

interface DrawingCanvasProps {
  tool: "brush" | "eraser"
  brushSize: number
  brushColor: string
  brushOpacity: number
  onDrawingStart?: () => void
  onDrawingEnd?: () => void
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void
  onDrawingEvent?: (event: any) => void
  onRemoteDrawingEvent?: (event: any) => void
  disabled?: boolean
}

export interface DrawingCanvasRef {
  undo: () => void
  redo: () => void
  clear: () => void
  getImageData: () => string
  applyDrawingEvent: (event: any) => void
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      tool,
      brushSize,
      brushColor,
      brushOpacity,
      onDrawingStart,
      onDrawingEnd,
      onUndoRedoChange,
      onDrawingEvent,
      onRemoteDrawingEvent,
      disabled = false,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [undoStack, setUndoStack] = useState<ImageData[]>([])
    const [redoStack, setRedoStack] = useState<ImageData[]>([])
    const [remoteDrawingPath, setRemoteDrawingPath] = useState<{x: number, y: number}[]>([])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext("2d")
      if (!context) return

      // Set canvas size
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      context.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Set drawing properties
      context.lineCap = "round"
      context.lineJoin = "round"
      context.imageSmoothingEnabled = true

      contextRef.current = context

      // Save initial state
      saveState()
    }, [])

    // Listen for remote drawing events and canvas clear events
    useEffect(() => {
      const handleRemoteDrawingEvent = (event: CustomEvent) => {
        applyDrawingEvent(event.detail)
      }

      const handleRemoteCanvasCleared = () => {
        clearCanvas()
      }

      const handleNewRoundClear = () => {
        clearCanvas()
      }

      window.addEventListener('remote-drawing-event', handleRemoteDrawingEvent as EventListener)
      window.addEventListener('remote-canvas-cleared', handleRemoteCanvasCleared)
      window.addEventListener('clear-canvas-new-round', handleNewRoundClear)

      return () => {
        window.removeEventListener('remote-drawing-event', handleRemoteDrawingEvent as EventListener)
        window.removeEventListener('remote-canvas-cleared', handleRemoteCanvasCleared)
        window.removeEventListener('clear-canvas-new-round', handleNewRoundClear)
      }
    }, [])

    useEffect(() => {
      onUndoRedoChange?.(undoStack.length > 1, redoStack.length > 0)
    }, [undoStack.length, redoStack.length, onUndoRedoChange])

    const saveState = () => {
      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      setUndoStack((prev) => [...prev.slice(-19), imageData]) // Keep last 20 states
      setRedoStack([]) // Clear redo stack when new action is performed
    }

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled) return

      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      setIsDrawing(true)
      onDrawingStart?.()

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over"
      context.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : brushColor
      context.lineWidth = brushSize
      context.globalAlpha = tool === "eraser" ? 1 : brushOpacity / 100

      context.beginPath()
      context.moveTo(x, y)

      // Send drawing event to other players
      onDrawingEvent?.({
        type: "start",
        x,
        y,
        tool,
        color: brushColor,
        size: brushSize,
        opacity: brushOpacity,
      })
    }

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || disabled) return

      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      context.lineTo(x, y)
      context.stroke()

      // Send drawing event to other players
      onDrawingEvent?.({
        type: "draw",
        x,
        y,
        tool,
        color: brushColor,
        size: brushSize,
        opacity: brushOpacity,
      })
    }

    const stopDrawing = () => {
      if (!isDrawing) return

      setIsDrawing(false)
      onDrawingEnd?.()
      saveState()

      // Send end drawing event
      onDrawingEvent?.({
        type: "end",
        x: 0,
        y: 0,
        tool,
        color: brushColor,
        size: brushSize,
        opacity: brushOpacity,
      })
    }

    const applyDrawingEvent = (event: any) => {
      const context = contextRef.current
      if (!context) return

      // Apply the same drawing properties as the drawer
      context.globalCompositeOperation = event.tool === "eraser" ? "destination-out" : "source-over"
      context.strokeStyle = event.tool === "eraser" ? "rgba(0,0,0,1)" : event.color
      context.lineWidth = event.size
      context.globalAlpha = event.tool === "eraser" ? 1 : event.opacity / 100

      if (event.type === "start") {
        context.beginPath()
        context.moveTo(event.x, event.y)
        setRemoteDrawingPath([{x: event.x, y: event.y}])
      } else if (event.type === "draw") {
        context.lineTo(event.x, event.y)
        context.stroke()
        setRemoteDrawingPath(prev => [...prev, {x: event.x, y: event.y}])
      } else if (event.type === "end") {
        setRemoteDrawingPath([])
        // Don't save state for remote events to avoid conflicts
      }
    }

    const clearCanvas = () => {
      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      context.clearRect(0, 0, canvas.width, canvas.height)
      // Reset undo/redo stacks when clearing
      setUndoStack([])
      setRedoStack([])
      // Save the cleared state
      setTimeout(() => saveState(), 0)
    }

    const undo = () => {
      if (undoStack.length <= 1) return

      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      const currentState = undoStack[undoStack.length - 1]
      const previousState = undoStack[undoStack.length - 2]

      setRedoStack((prev) => [...prev, currentState])
      setUndoStack((prev) => prev.slice(0, -1))

      context.putImageData(previousState, 0, 0)
    }

    const redo = () => {
      if (redoStack.length === 0) return

      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      const stateToRestore = redoStack[redoStack.length - 1]
      setUndoStack((prev) => [...prev, stateToRestore])
      setRedoStack((prev) => prev.slice(0, -1))

      context.putImageData(stateToRestore, 0, 0)
    }

    const clear = () => {
      clearCanvas()
    }

    const getImageData = () => {
      const canvas = canvasRef.current
      if (!canvas) return ""
      return canvas.toDataURL()
    }

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clear,
      getImageData,
      applyDrawingEvent,
    }))

    return (
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    )
  },
)

DrawingCanvas.displayName = "DrawingCanvas"