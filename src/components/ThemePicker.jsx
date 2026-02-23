import { THEMES, THEME_NAMES } from '../constants'
import { useTheme } from '../contexts/ThemeContext'

const THEME_LABELS = {
  'pastel-pink': 'Pink',
  'midnight-blue': 'Midnight',
  'soft-yellow': 'Yellow',
  'mint-green': 'Mint',
  'cloud-white': 'Cloud',
}

export default function ThemePicker() {
  const { theme, darkMode, setTheme, toggleDarkMode } = useTheme()

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm">
      {/* Theme swatches */}
      <div className="flex gap-3">
        {THEME_NAMES.map((name) => {
          const t = THEMES[name]
          const isSelected = theme === name
          return (
            <button
              key={name}
              onClick={() => setTheme(name)}
              className="flex flex-col items-center gap-1 group"
              aria-label={`Select ${name} theme`}
              aria-pressed={isSelected}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-gray-800 scale-110 ring-2 ring-offset-2 ring-gray-400'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: t.primary }}
              />
              <span className="text-xs text-gray-600 font-medium">
                {THEME_LABELS[name]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Dark mode toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-sm text-gray-600">☀️</span>
        <div className="relative">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            className="sr-only peer"
            aria-label="Toggle dark mode"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-500 transition-colors duration-200" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
        </div>
        <span className="text-sm text-gray-600">🌙</span>
      </label>
    </div>
  )
}
