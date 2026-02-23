import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { subYears, format } from 'date-fns'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/firebase'
import { getRandomQuote } from '../utils/quotes'
import quotesData from '../data/quotes.json'
import MoodSelector from '../components/MoodSelector'
import { MOOD_EMOJIS } from '../constants'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', emoji: '🌅' }
  if (hour < 18) return { text: 'Good Afternoon', emoji: '☀️' }
  return { text: 'Good Evening', emoji: '🌙' }
}

function formatEntryDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function stripContent(content) {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, 100)
  // TipTap JSONContent — extract text from first paragraph
  try {
    const texts = []
    const walk = (node) => {
      if (node.text) texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    walk(content)
    const joined = texts.join(' ')
    return joined.length > 100 ? joined.slice(0, 100) + '…' : joined
  } catch {
    return ''
  }
}

/* ── skeleton pulse for loading state ── */
function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-pink-100/50 ${className}`}>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-pink-200/60 rounded w-3/4" />
        <div className="h-3 bg-pink-200/40 rounded w-full" />
        <div className="h-3 bg-pink-200/40 rounded w-1/2" />
      </div>
    </div>
  )
}

/* ── animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

/* ── mood fill colors for heatmap ── */
const MOOD_FILL_COLORS = {
  happy: '#fde047',
  sad: '#93c5fd',
  productive: '#86efac',
  romantic: '#f9a8d4',
  anxious: '#fdba74',
  calm: '#5eead4',
  neutral: '#d1d5db',
}

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [userData, setUserData] = useState(null)
  const [recentEntries, setRecentEntries] = useState([])
  const [heatmapValues, setHeatmapValues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState(null)

  const greeting = useMemo(() => getGreeting(), [])
  const quote = useMemo(() => getRandomQuote(quotesData), [])

  /* fetch user doc + recent entries + heatmap data on mount */
  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function fetchData() {
      try {
        // user doc
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (!cancelled && userSnap.exists()) {
          setUserData(userSnap.data())
        }

        // recent entries (last 5, newest first)
        const entriesQuery = query(
          collection(db, 'entries'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(5),
        )
        const entriesSnap = await getDocs(entriesQuery)
        if (!cancelled) {
          setRecentEntries(
            entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          )
        }

        // heatmap: entries from the past year
        const oneYearAgo = subYears(new Date(), 1)
        const heatmapQuery = query(
          collection(db, 'entries'),
          where('userId', '==', user.uid),
          where('date', '>=', Timestamp.fromDate(oneYearAgo)),
          orderBy('date', 'asc'),
        )
        const heatmapSnap = await getDocs(heatmapQuery)
        if (!cancelled) {
          setHeatmapValues(
            heatmapSnap.docs.map((d) => {
              const data = d.data()
              const entryDate = data.date.toDate()
              return {
                date: format(entryDate, 'yyyy-MM-dd'),
                count: 1,
                mood: data.mood,
              }
            }),
          )
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user])

  const displayName =
    userData?.name || user?.displayName || 'Friend'

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="animate-pulse h-10 bg-pink-200/40 rounded w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard className="h-28" />
          <SkeletonCard className="h-28" />
        </div>
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-24" />
      </div>
    )
  }

  /* ── main dashboard ── */
  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* greeting */}
      <motion.h1
        variants={cardVariants}
        className="font-['Pacifico'] text-3xl sm:text-4xl text-[var(--color-text,#4A2040)]"
      >
        {greeting.text}, {displayName} {greeting.emoji}
      </motion.h1>

      {/* streak + write button row */}
      <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-sm border border-pink-100">
          <span className="text-2xl">🔥</span>
          <span className="font-['Poppins'] text-lg font-semibold text-[var(--color-text,#4A2040)]">
            {userData?.streak ?? 0} day streak
          </span>
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="ml-auto bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-['Poppins'] font-medium px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          ✏️ Write Today's Entry
        </button>
      </motion.div>

      {/* streak heatmap */}
      <motion.div
        variants={cardVariants}
        className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm border border-pink-100"
      >
        <h2 className="font-['Caveat'] text-xl text-[var(--color-text,#4A2040)] mb-3">
          Your Year in Entries 🗓️
        </h2>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={subYears(new Date(), 1)}
            endDate={new Date()}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value) return 'color-empty'
              return 'color-filled'
            }}
            titleForValue={(value) => {
              if (!value) return 'No entry'
              const emoji = MOOD_EMOJIS[value.mood] || ''
              return `${value.date} — ${value.mood} ${emoji}`
            }}
            transformDayElement={(element, value) => {
              if (!value || !value.mood) return element
              return React.cloneElement(element, {
                ...element.props,
                style: {
                  ...element.props.style,
                  fill: MOOD_FILL_COLORS[value.mood] || '#d1d5db',
                },
              })
            }}
            showWeekdayLabels
          />
        </div>
      </motion.div>

      {/* motivational quote */}
      {quote && (
        <motion.div
          variants={cardVariants}
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: quote.backgroundColor }}
        >
          <p className="font-['Caveat'] text-xl sm:text-2xl text-gray-800 leading-relaxed">
            "{quote.text}"
          </p>
          <p className="font-['Poppins'] text-sm text-gray-600 mt-2">— {quote.author}</p>
        </motion.div>
      )}

      {/* mood selector */}
      <motion.div variants={cardVariants} className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm border border-pink-100">
        <h2 className="font-['Caveat'] text-xl text-[var(--color-text,#4A2040)] mb-3">
          How are you feeling right now?
        </h2>
        <MoodSelector value={selectedMood} onChange={setSelectedMood} />
      </motion.div>

      {/* recent entries */}
      <motion.section variants={cardVariants}>
        <h2 className="font-['Caveat'] text-2xl text-[var(--color-text,#4A2040)] mb-4">
          Recent Entries 📝
        </h2>

        {recentEntries.length === 0 ? (
          <p className="font-['Poppins'] text-gray-400 text-sm">
            No entries yet. Start writing your first diary entry!
          </p>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/editor/${entry.id}`}
                className="block bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-pink-100 hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-['Poppins'] font-medium text-[var(--color-text,#4A2040)] truncate">
                      {entry.title || 'Untitled'}
                    </h3>
                    <p className="font-['Poppins'] text-sm text-gray-500 mt-1 line-clamp-2">
                      {stripContent(entry.content)}
                    </p>
                    <span className="font-['Poppins'] text-xs text-gray-400 mt-2 inline-block">
                      {formatEntryDate(entry.date)}
                    </span>
                  </div>
                  {entry.mood && (
                    <span className="text-2xl flex-shrink-0" title={entry.mood}>
                      {MOOD_EMOJIS[entry.mood] || '📝'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  )
}

export default DashboardPage
