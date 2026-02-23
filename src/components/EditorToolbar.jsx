import { useCallback } from 'react'

const FONT_FAMILIES = [
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Caveat', value: 'Caveat' },
  { label: 'Pacifico', value: 'Pacifico' },
]

const FONT_SIZES = [
  { label: 'S', value: '14px' },
  { label: 'M', value: '18px' },
  { label: 'L', value: '24px' },
]

const TEXT_COLORS = [
  '#4A2040', '#1E3A5F', '#744210', '#22543D', '#2D3748',
  '#FF69B4', '#63B3ED', '#ECC94B', '#48BB78', '#A0AEC0',
  '#E53E3E', '#805AD5', '#DD6B20', '#319795', '#718096',
]

const HIGHLIGHT_COLORS = [
  '#FFE4E1', '#E6E6FA', '#FEFCBF', '#F0FFF4', '#EBF8FF',
  '#FFF0F5', '#FED7E2', '#FEEBC8', '#C6F6D5', '#BEE3F8',
]

function EditorToolbar({ editor }) {
  if (!editor) return null

  const setFontFamily = useCallback((family) => {
    editor.chain().focus().setFontFamily(family).run()
  }, [editor])

  const setFontSize = useCallback((size) => {
    editor.chain().focus().setFontSize(size).run()
  }, [editor])

  const setTextColor = useCallback((color) => {
    editor.chain().focus().setColor(color).run()
  }, [editor])

  const toggleHighlight = useCallback((color) => {
    editor.chain().focus().toggleHighlight({ color }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-pink-50/80 rounded-2xl border border-pink-100 mb-4">
      {/* Font Family */}
      <div className="flex items-center gap-1">
        <label className="sr-only" htmlFor="font-family-select">Font family</label>
        <select
          id="font-family-select"
          onChange={(e) => setFontFamily(e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white border border-pink-200 text-sm font-['Poppins'] text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
          aria-label="Font family"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-pink-200" aria-hidden="true" />

      {/* Font Size */}
      <div className="flex items-center gap-1" role="group" aria-label="Font size">
        {FONT_SIZES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFontSize(s.value)}
            className="px-2.5 py-1 rounded-lg text-sm font-['Poppins'] bg-white border border-pink-200 hover:bg-pink-100 transition-colors text-gray-700"
            aria-label={`Font size ${s.label}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-pink-200" aria-hidden="true" />

      {/* Bold / Italic / Strikethrough */}
      <div className="flex items-center gap-1" role="group" aria-label="Text formatting">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold border transition-colors ${
            editor.isActive('bold')
              ? 'bg-pink-200 border-pink-300 text-pink-800'
              : 'bg-white border-pink-200 hover:bg-pink-100 text-gray-700'
          }`}
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded-lg text-sm italic border transition-colors ${
            editor.isActive('italic')
              ? 'bg-pink-200 border-pink-300 text-pink-800'
              : 'bg-white border-pink-200 hover:bg-pink-100 text-gray-700'
          }`}
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2.5 py-1 rounded-lg text-sm line-through border transition-colors ${
            editor.isActive('strike')
              ? 'bg-pink-200 border-pink-300 text-pink-800'
              : 'bg-white border-pink-200 hover:bg-pink-100 text-gray-700'
          }`}
          aria-label="Strikethrough"
          aria-pressed={editor.isActive('strike')}
        >
          S
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-pink-200" aria-hidden="true" />

      {/* Text Color */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-['Poppins'] text-gray-500 mr-1">Text</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Text color">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setTextColor(color)}
              className="w-5 h-5 rounded-full border border-gray-200 hover:scale-125 transition-transform cursor-pointer"
              style={{ backgroundColor: color }}
              aria-label={`Text color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-pink-200" aria-hidden="true" />

      {/* Highlight Color */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-['Poppins'] text-gray-500 mr-1">Highlight</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Highlight color">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleHighlight(color)}
              className="w-5 h-5 rounded-full border border-gray-200 hover:scale-125 transition-transform cursor-pointer"
              style={{ backgroundColor: color }}
              aria-label={`Highlight color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditorToolbar
