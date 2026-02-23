import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { saveEntry, getEntry } from '../services/entries'
import { validateTitle, validateEntryDate } from '../utils/validation'
import MoodSelector from '../components/MoodSelector'
import EditorToolbar from '../components/EditorToolbar'

const DRAFT_KEY = 'dearme-draft'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

/**
 * Loads a draft from localStorage.
 * @returns {object|null} The draft object or null if none exists.
 */
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Saves a draft to localStorage.
 */
function saveDraftToStorage(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Silently fail if localStorage is full
  }
}

/**
 * Clears the draft from localStorage.
 */
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

function EditorPage() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('neutral')
  const [images, setImages] = useState([])
  const [drawingURL, setDrawingURL] = useState(null)
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(!!entryId)
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [existingEntryId, setExistingEntryId] = useState(entryId || null)

  const autoSaveTimerRef = useRef(null)
  const editorReadyRef = useRef(false)

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
    ],
    content: '<p>Start writing your thoughts...</p>',
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] font-['Poppins'] text-gray-800 p-4",
      },
    },
    onUpdate: () => {
      // Mark editor as having user content
      editorReadyRef.current = true
    },
  })

  // Task 7.3 — Load existing entry when entryId is present
  useEffect(() => {
    if (!entryId || !user) return

    let cancelled = false

    async function fetchEntry() {
      try {
        setLoading(true)
        const entry = await getEntry(entryId, user.uid)

        if (cancelled) return

        setTitle(entry.title || '')
        setMood(entry.mood || 'neutral')
        setImages(entry.images || [])
        setDrawingURL(entry.drawingURL || null)
        setExistingEntryId(entryId)

        if (editor && entry.content) {
          editor.commands.setContent(entry.content)
        }
      } catch (err) {
        if (!cancelled) {
          setErrors([err.message || 'Failed to load entry'])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEntry()
    return () => { cancelled = true }
  }, [entryId, user, editor])

  // Task 7.4 — Check for draft on mount (new entry only)
  useEffect(() => {
    if (entryId) return // Don't restore drafts when editing existing entries

    const draft = loadDraft()
    if (draft && (draft.title || draft.mood !== 'neutral' || draft.content)) {
      setShowDraftPrompt(true)
    }
  }, [entryId])

  // Restore draft handler
  const restoreDraft = useCallback(() => {
    const draft = loadDraft()
    if (!draft) return

    if (draft.title) setTitle(draft.title)
    if (draft.mood) setMood(draft.mood)
    if (editor && draft.content) {
      editor.commands.setContent(draft.content)
    }
    setShowDraftPrompt(false)
  }, [editor])

  const dismissDraft = useCallback(() => {
    clearDraft()
    setShowDraftPrompt(false)
  }, [])

  // Task 7.4 — Auto-save draft every 30 seconds (new entries only)
  useEffect(() => {
    if (entryId) return // Don't auto-save drafts for existing entries

    autoSaveTimerRef.current = setInterval(() => {
      if (!editor) return

      const draft = {
        title,
        mood,
        content: editor.getJSON(),
        savedAt: new Date().toISOString(),
      }
      saveDraftToStorage(draft)
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [entryId, title, mood, editor])

  // Task 7.2 — Save entry handler
  const handleSave = useCallback(async () => {
    if (!editor || !user) return

    const validationErrors = []

    const titleResult = validateTitle(title)
    if (!titleResult.valid) validationErrors.push(titleResult.error)

    const dateResult = validateEntryDate(new Date())
    if (!dateResult.valid) validationErrors.push(dateResult.error)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setSaving(true)

    try {
      const entryInput = {
        title: title.trim(),
        content: editor.getJSON(),
        mood,
        images,
        drawingURL,
        theme: 'pastel-pink',
        date: new Date(),
      }

      await saveEntry(user.uid, entryInput, existingEntryId || undefined)

      // Clear draft on successful save
      clearDraft()

      // Show success animation
      setShowSuccess(true)

      // Redirect to dashboard after animation
      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (err) {
      setErrors([err.message || 'Failed to save entry'])
    } finally {
      setSaving(false)
    }
  }, [editor, user, title, mood, images, drawingURL, existingEntryId, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="font-['Poppins'] text-gray-500">Loading entry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <span className="text-5xl mb-3 block">✨</span>
              <p className="font-['Caveat'] text-2xl text-pink-600">Entry saved!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draft restore prompt */}
      <AnimatePresence>
        {showDraftPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-between"
          >
            <p className="font-['Poppins'] text-sm text-yellow-800">
              You have an unsaved draft. Would you like to restore it?
            </p>
            <div className="flex gap-2 ml-4">
              <button
                type="button"
                onClick={restoreDraft}
                className="px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={dismissDraft}
                className="px-3 py-1.5 bg-white text-gray-600 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page heading */}
      <h1 className="font-['Caveat'] text-3xl sm:text-4xl text-[var(--color-text,#4A2040)] mb-6">
        {existingEntryId ? '✏️ Edit Entry' : '📝 New Entry'}
      </h1>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
          {errors.map((err, i) => (
            <p key={i} className="font-['Poppins'] text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="entry-title" className="block font-['Poppins'] text-sm text-gray-600 mb-1">
          Title
        </label>
        <input
          id="entry-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title..."
          maxLength={200}
          className="w-full px-4 py-3 rounded-2xl border border-pink-200 bg-white font-['Caveat'] text-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-shadow"
        />
        <p className="mt-1 text-xs font-['Poppins'] text-gray-400 text-right">
          {title.length}/200
        </p>
      </div>

      {/* Mood selector */}
      <div className="mb-6">
        <p className="font-['Poppins'] text-sm text-gray-600 mb-2">How are you feeling?</p>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* Editor toolbar */}
      <EditorToolbar editor={editor} />

      {/* TipTap editor — paper-like area */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm min-h-[350px] mb-6 overflow-hidden"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f9e4ec 31px, #f9e4ec 32px)',
          backgroundSize: '100% 32px',
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-8 py-3 rounded-2xl font-['Poppins'] font-medium text-white shadow-lg transition-colors ${
            saving
              ? 'bg-pink-300 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 cursor-pointer'
          }`}
        >
          {saving ? 'Saving...' : existingEntryId ? 'Update Entry' : 'Save Entry'}
        </motion.button>
      </div>
    </div>
  )
}

export default EditorPage
