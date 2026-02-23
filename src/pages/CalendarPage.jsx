import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { getEntriesForMonth, getEntry } from '../services/entries'
import { MOOD_EMOJIS } from '../constants'

/** Map moods to soft pastel dot colors */
const MOOD_COLORS = {
  happy: 'bg-yellow-300',
  sad: 'bg-blue-300',
  productive: 'bg-green-300',
  romantic: 'bg-pink-300',
  anxious: 'bg-orange-300',
  calm: 'bg-teal-300',
  neutral: 'bg-gray-300',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ── helper: extract text from TipTap JSONContent ── */
function extractText(content) {
  if (!content) return ''
  if (typeof content === 'string') return content
  const texts = []
  const walk = (node) => {
    if (node.text) texts.push(node.text)
    if (node.content) node.content.forEach(walk)
  }
  walk(content)
  return texts.join(' ')
}

/* ── Entry Read Modal ── */
function EntryReadModal({ entry, onClose }) {
  if (!entry) return null

  const dateStr = entry.date?.toDate
    ? format(entry.date.toDate(), 'MMMM d, yyyy')
    : format(new Date(entry.date), 'MMMM d, yyyy')

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative"
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{ perspective: 1200 }}
        >
          {/* close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          {/* mood + date */}
          <div className="flex items-center gap-3 mb-4">
            {entry.mood && (
              <span className="text-3xl">{MOOD_EMOJIS[entry.mood] || '📝'}</span>
            )}
            <div>
              <h2 className="font-['Pacifico'] text-2xl text-[var(--color-text,#4A2040)]">
                {entry.title || 'Untitled'}
              </h2>
              <p className="font-['Poppins'] text-sm text-gray-400">{dateStr}</p>
            </div>
          </div>

          {/* text content */}
          <div className="font-['Poppins'] text-[var(--color-text,#4A2040)] leading-relaxed whitespace-pre-wrap mb-4">
            {extractText(entry.content)}
          </div>

          {/* images */}
          {entry.images && entry.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {entry.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Entry image ${i + 1}`}
                  className="rounded-xl object-cover w-full h-32"
                />
              ))}
            </div>
          )}

          {/* drawing */}
          {entry.drawingURL && (
            <div className="mb-4">
              <p className="font-['Caveat'] text-lg text-gray-500 mb-1">Drawing ✏️</p>
              <img
                src={entry.drawingURL}
                alt="Drawing"
                className="rounded-xl border border-pink-100 w-full"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Main CalendarPage ── */
function CalendarPage() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  /* fetch entries for the displayed month */
  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const data = await getEntriesForMonth(user.uid, year, month)
      setEntries(data)
    } catch (err) {
      console.error('Failed to load calendar entries:', err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [user, currentMonth])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  /* build calendar grid days */
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  /* find entry for a given day */
  const getEntryForDay = (day) =>
    entries.find((e) => isSameDay(e.date, day))

  /* handle date click */
  const handleDateClick = async (day) => {
    const summary = getEntryForDay(day)
    if (!summary || !user) return
    try {
      const fullEntry = await getEntry(summary.entryId, user.uid)
      setSelectedEntry(fullEntry)
      setModalOpen(true)
    } catch (err) {
      console.error('Failed to load entry:', err)
    }
  }

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1))
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* header with month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm border border-pink-100 hover:bg-pink-50 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          ◀
        </button>
        <h1 className="font-['Pacifico'] text-2xl sm:text-3xl text-[var(--color-text,#4A2040)]">
          {format(currentMonth, 'MMMM yyyy')} 📅
        </h1>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm border border-pink-100 hover:bg-pink-50 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center font-['Poppins'] text-xs font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* calendar grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-pink-50/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const inMonth = isSameMonth(day, currentMonth)
            const entry = getEntryForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={entry ? { scale: 1.08 } : {}}
                whileTap={entry ? { scale: 0.95 } : {}}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center gap-1
                  transition-all text-sm font-['Poppins'] relative
                  ${inMonth ? 'text-[var(--color-text,#4A2040)]' : 'text-gray-300'}
                  ${isToday ? 'ring-2 ring-pink-300 bg-pink-50' : 'bg-white/60'}
                  ${entry ? 'cursor-pointer hover:shadow-md hover:bg-white' : 'cursor-default'}
                  shadow-sm border border-pink-50
                `}
                disabled={!entry}
              >
                <span className={`text-xs ${isToday ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                {entry && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${MOOD_COLORS[entry.mood] || 'bg-gray-300'}`}
                    title={entry.mood}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* entry read modal */}
      {modalOpen && selectedEntry && (
        <EntryReadModal
          entry={selectedEntry}
          onClose={() => {
            setModalOpen(false)
            setSelectedEntry(null)
          }}
        />
      )}
    </div>
  )
}

export default CalendarPage
