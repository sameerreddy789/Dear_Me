import { OFFLINE_ENTRY_KEY, QUOTA_ERROR_CODES } from '../constants'

/**
 * Saves an entry to localStorage when Firestore save fails (offline fallback).
 * Requirement 13.1
 * @param {object} entry - The entry data to persist locally
 */
export function saveOfflineEntry(entry) {
  try {
    localStorage.setItem(OFFLINE_ENTRY_KEY, JSON.stringify(entry))
  } catch {
    // localStorage full — nothing more we can do
  }
}

/**
 * Loads a previously saved offline entry from localStorage.
 * Requirement 13.2
 * @returns {object|null} The offline entry or null if none exists
 */
export function loadOfflineEntry() {
  try {
    const raw = localStorage.getItem(OFFLINE_ENTRY_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Clears the offline entry from localStorage after successful sync.
 */
export function clearOfflineEntry() {
  localStorage.removeItem(OFFLINE_ENTRY_KEY)
}

/**
 * Checks if a Firestore error indicates quota exceeded.
 * @param {Error|object|null} err - The error to check
 * @returns {boolean}
 */
export function isQuotaExceededError(err) {
  const code = err?.code || ''
  const message = (err?.message || '').toLowerCase()
  return QUOTA_ERROR_CODES.some(c => code.includes(c) || message.includes(c))
}

/**
 * Checks if an error is a network/offline error.
 * @param {Error|object|null} err - The error to check
 * @returns {boolean}
 */
export function isNetworkError(err) {
  const message = (err?.message || '').toLowerCase()
  const code = err?.code || ''
  return (
    code === 'unavailable' ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('failed to fetch') ||
    message.includes('unavailable') ||
    !navigator.onLine
  )
}
