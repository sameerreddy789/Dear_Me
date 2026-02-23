import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveOfflineEntry,
  loadOfflineEntry,
  clearOfflineEntry,
  isQuotaExceededError,
  isNetworkError,
} from '../utils/offline'
import { OFFLINE_ENTRY_KEY } from '../constants'

describe('Offline Entry Storage (Req 13.1, 13.2)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves an entry to localStorage', () => {
    const entry = { userId: 'u1', title: 'Test', mood: 'happy', date: '2025-01-01' }
    saveOfflineEntry(entry)

    const stored = loadOfflineEntry()
    expect(stored).toEqual(entry)
  })

  it('returns null when no offline entry exists', () => {
    expect(loadOfflineEntry()).toBeNull()
  })

  it('clears the offline entry', () => {
    saveOfflineEntry({ userId: 'u1', title: 'Test' })
    clearOfflineEntry()
    expect(loadOfflineEntry()).toBeNull()
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem(OFFLINE_ENTRY_KEY, 'not-json{{{')
    expect(loadOfflineEntry()).toBeNull()
  })

  it('preserves all entry fields through save/load cycle', () => {
    const entry = {
      userId: 'user-123',
      title: 'My Offline Entry',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      mood: 'calm',
      images: ['https://example.com/img.jpg'],
      drawingURL: 'https://example.com/draw.png',
      theme: 'pastel-pink',
      date: '2025-07-01T12:00:00.000Z',
      existingEntryId: null,
      savedAt: '2025-07-01T12:00:00.000Z',
    }
    saveOfflineEntry(entry)
    expect(loadOfflineEntry()).toEqual(entry)
  })
})

describe('Error Classification', () => {
  describe('isQuotaExceededError', () => {
    it('detects resource-exhausted error code', () => {
      expect(isQuotaExceededError({ code: 'resource-exhausted' })).toBe(true)
    })

    it('detects quota-exceeded in message', () => {
      expect(isQuotaExceededError({ message: 'resource-exhausted: quota limit reached' })).toBe(true)
    })

    it('returns false for regular errors', () => {
      expect(isQuotaExceededError({ message: 'Permission denied' })).toBe(false)
    })

    it('returns false for null/undefined', () => {
      expect(isQuotaExceededError(null)).toBe(false)
      expect(isQuotaExceededError(undefined)).toBe(false)
    })
  })

  describe('isNetworkError', () => {
    it('detects unavailable error code', () => {
      expect(isNetworkError({ code: 'unavailable' })).toBe(true)
    })

    it('detects network error in message', () => {
      expect(isNetworkError({ message: 'A network error occurred' })).toBe(true)
    })

    it('detects offline in message', () => {
      expect(isNetworkError({ message: 'Client is offline' })).toBe(true)
    })

    it('detects failed to fetch', () => {
      expect(isNetworkError({ message: 'Failed to fetch' })).toBe(true)
    })

    it('returns false for permission errors', () => {
      expect(isNetworkError({ code: 'permission-denied', message: 'Permission denied' })).toBe(false)
    })

    it('returns false for null/undefined', () => {
      expect(isNetworkError(null)).toBe(false)
      expect(isNetworkError(undefined)).toBe(false)
    })
  })
})
