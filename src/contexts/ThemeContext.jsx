import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { THEMES, THEME_NAMES } from '../constants'
import { useAuth } from './AuthContext'
import { db } from '../services/firebase'

const ThemeContext = createContext(null)

/**
 * Applies theme CSS custom properties to :root.
 * In dark mode, overrides background, surface, and text colors.
 */
export function applyTheme(themeName, darkMode) {
  const theme = THEMES[themeName]
  if (!theme) return

  const root = document.documentElement

  if (darkMode) {
    root.style.setProperty('--color-primary', theme.secondary)
    root.style.setProperty('--color-background', '#1A202C')
    root.style.setProperty('--color-surface', '#2D3748')
    root.style.setProperty('--color-text', '#E2E8F0')
  } else {
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)
  }

  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--paper-texture', `url(${theme.paperTexture})`)
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState('pastel-pink')
  const [darkMode, setDarkMode] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load theme preference from Firestore on user login
  useEffect(() => {
    if (!user) {
      setLoaded(true)
      return
    }

    const loadTheme = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          if (data.theme && THEME_NAMES.includes(data.theme)) {
            setThemeState(data.theme)
          }
          if (typeof data.darkMode === 'boolean') {
            setDarkMode(data.darkMode)
          }
        }
      } catch (err) {
        console.error('Failed to load theme preference:', err)
      } finally {
        setLoaded(true)
      }
    }

    loadTheme()
  }, [user])

  // Apply theme whenever theme or darkMode changes
  useEffect(() => {
    applyTheme(theme, darkMode)
  }, [theme, darkMode])

  // Persist theme to Firestore when it changes (after initial load)
  const persistTheme = useCallback(
    async (newTheme, newDarkMode) => {
      if (!user) return
      try {
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, { theme: newTheme, darkMode: newDarkMode })
      } catch (err) {
        console.error('Failed to persist theme preference:', err)
      }
    },
    [user]
  )

  const setTheme = useCallback(
    (themeName) => {
      if (THEME_NAMES.includes(themeName)) {
        setThemeState(themeName)
        persistTheme(themeName, darkMode)
      }
    },
    [darkMode, persistTheme]
  )

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev
      persistTheme(theme, next)
      return next
    })
  }, [theme, persistTheme])

  const value = {
    theme,
    darkMode,
    setTheme,
    toggleDarkMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
