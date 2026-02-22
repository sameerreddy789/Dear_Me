import { MOODS, MOOD_EMOJIS } from '../constants'

const MOOD_COLORS = {
  happy: { bg: 'bg-yellow-100', border: 'border-yellow-400', hover: 'hover:bg-yellow-50' },
  sad: { bg: 'bg-blue-100', border: 'border-blue-400', hover: 'hover:bg-blue-50' },
  productive: { bg: 'bg-green-100', border: 'border-green-400', hover: 'hover:bg-green-50' },
  romantic: { bg: 'bg-pink-100', border: 'border-pink-400', hover: 'hover:bg-pink-50' },
  anxious: { bg: 'bg-orange-100', border: 'border-orange-400', hover: 'hover:bg-orange-50' },
  calm: { bg: 'bg-teal-100', border: 'border-teal-400', hover: 'hover:bg-teal-50' },
  neutral: { bg: 'bg-gray-100', border: 'border-gray-400', hover: 'hover:bg-gray-50' },
}

function MoodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Select your mood">
      {MOODS.map((mood) => {
        const isSelected = value === mood
        const colors = MOOD_COLORS[mood]

        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(mood)}
            aria-label={`${mood} mood`}
            aria-pressed={isSelected}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer font-['Poppins'] text-sm capitalize ${
              isSelected
                ? `${colors.bg} ${colors.border} shadow-md scale-105`
                : `bg-white border-transparent ${colors.hover} hover:shadow-sm`
            }`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {MOOD_EMOJIS[mood]}
            </span>
            <span className={isSelected ? 'font-medium' : 'text-gray-500'}>
              {mood}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default MoodSelector
