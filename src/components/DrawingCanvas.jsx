import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas as FabricCanvas, PencilBrush } from 'fabric'

const PASTEL_COLORS = [
  '#2D2D2D', // dark (default)
  '#FF6B6B', // coral
  '#FFB347', // orange
  '#FDFD96', // yellow
  '#77DD77', // green
  '#89CFF0', // blue
  '#B19CD9', // lavender
  '#FFB6C1', // pink
  '#FFFFFF', // white
]

const MIN_BRUSH_SIZE = 2
const MAX_BRUSH_SIZE = 30
const DEFAULT_BRUSH_SIZE = 5
const ERASER_COLOR = '#FFFFFF'

/**
 * DrawingCanvas — Fabric.js powered freehand drawing component.
 * @param {{ width: number, height: number, onSave: (dataURL: string) => void, onClose: () => void }} props
 */
function DrawingCanvas({ width, height, onSave, onClose }) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)

  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState(PASTEL_COLORS[0])
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE)

  // Store the last pencil color so we can restore it after eraser
  const lastColorRef = useRef(PASTEL_COLORS[0])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasElRef.current) return

    const canvas = new FabricCanvas(canvasElRef.current, {
      isDrawingMode: true,
      width,
      height,
      backgroundColor: '#FFFFFF',
    })

    const brush = new PencilBrush(canvas)
    brush.color = PASTEL_COLORS[0]
    brush.width = DEFAULT_BRUSH_SIZE
    canvas.freeDrawingBrush = brush

    fabricRef.current = canvas

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [width, height])

  // Sync brush settings whenever tool, color, or brushSize changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !canvas.freeDrawingBrush) return

    if (tool === 'eraser') {
      canvas.freeDrawingBrush.color = ERASER_COLOR
      canvas.freeDrawingBrush.width = brushSize * 3 // wider for erasing
    } else {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = brushSize
    }
  }, [tool, color, brushSize])

  const handleToolChange = useCallback((newTool) => {
    if (newTool === 'pencil' && tool === 'eraser') {
      // Restore last pencil color
      setColor(lastColorRef.current)
    }
    if (newTool === 'eraser' && tool === 'pencil') {
      // Save current color before switching to eraser
      lastColorRef.current = color
    }
    setTool(newTool)
  }, [tool, color])

  const handleColorChange = useCallback((newColor) => {
    setColor(newColor)
    lastColorRef.current = newColor
    // Switch back to pencil when picking a color
    if (tool === 'eraser') {
      setTool('pencil')
    }
  }, [tool])

  const handleSave = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    try {
      const dataURL = canvas.toDataURL({ format: 'png' })
      onSave(dataURL)
    } catch (err) {
      // Error handled by parent via onSave rejection or try/catch
      console.error('Failed to export canvas:', err)
    }
  }, [onSave])

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-md mb-3 w-full max-w-[600px]">
        {/* Tool buttons */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleToolChange('pencil')}
            className={`px-3 py-1.5 rounded-xl text-sm font-['Poppins'] font-medium transition-colors cursor-pointer ${
              tool === 'pencil'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Pencil tool"
          >
            ✏️ Pencil
          </button>
          <button
            type="button"
            onClick={() => handleToolChange('eraser')}
            className={`px-3 py-1.5 rounded-xl text-sm font-['Poppins'] font-medium transition-colors cursor-pointer ${
              tool === 'eraser'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Eraser tool"
          >
            🧹 Eraser
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Color picker */}
        <div className="flex gap-1 flex-wrap">
          {PASTEL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                color === c && tool === 'pencil'
                  ? 'border-pink-500 scale-110'
                  : 'border-gray-200 hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Brush size slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-['Poppins'] text-gray-500">Size</span>
          <input
            type="range"
            min={MIN_BRUSH_SIZE}
            max={MAX_BRUSH_SIZE}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-pink-500"
            aria-label="Brush size"
          />
          <span className="text-xs font-['Poppins'] text-gray-500 w-5 text-center">
            {brushSize}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm bg-white">
        <canvas ref={canvasElRef} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl font-['Poppins'] text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 rounded-xl font-['Poppins'] text-sm font-medium bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md cursor-pointer"
        >
          💾 Save Drawing
        </button>
      </div>
    </div>
  )
}

export default DrawingCanvas
