import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => {
  const Timestamp = {
    fromDate: (date) => ({ toDate: () => date, seconds: Math.floor(date.getTime() / 1000) }),
    now: () => ({ toDate: () => new Date(), seconds: Math.floor(Date.now() / 1000) }),
  };

  return {
    doc: vi.fn(),
    collection: vi.fn(),
    runTransaction: vi.fn(),
    Timestamp,
    query: vi.fn((...args) => ({ _query: args })),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
  };
});

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('../utils/streak', () => ({ calculateStreak: vi.fn() }));
vi.mock('../utils/validation', () => ({
  validateEntryInput: vi.fn(() => ({ valid: true })),
}));

import { getEntriesForMonth, getEntry } from './entries';
import { getDocs, getDoc, doc, collection, query, where, orderBy, Timestamp } from 'firebase/firestore';

describe('getEntriesForMonth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns entry summaries sorted by date for a given month', async () => {
    const date1 = new Date(2025, 6, 5);
    const date2 = new Date(2025, 6, 15);

    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'entry1',
          data: () => ({
            date: Timestamp.fromDate(date1),
            title: 'Day One',
            mood: 'happy',
          }),
        },
        {
          id: 'entry2',
          data: () => ({
            date: Timestamp.fromDate(date2),
            title: 'Day Two',
            mood: 'calm',
          }),
        },
      ],
    });

    const results = await getEntriesForMonth('user123', 2025, 6);

    expect(results).toEqual([
      { entryId: 'entry1', date: date1, title: 'Day One', mood: 'happy' },
      { entryId: 'entry2', date: date2, title: 'Day Two', mood: 'calm' },
    ]);

    // Verify query was built with correct filters
    expect(where).toHaveBeenCalledWith('userId', '==', 'user123');
    expect(where).toHaveBeenCalledWith('date', '>=', expect.any(Object));
    expect(where).toHaveBeenCalledWith('date', '<=', expect.any(Object));
    expect(orderBy).toHaveBeenCalledWith('date', 'asc');
  });

  it('returns an empty array when no entries exist for the month', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    const results = await getEntriesForMonth('user123', 2025, 0);

    expect(results).toEqual([]);
  });

  it('uses correct date range for the month (0-indexed)', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await getEntriesForMonth('user123', 2025, 1); // February 2025

    // Verify where was called with date range timestamps
    const dateCalls = where.mock.calls.filter(([field]) => field === 'date');
    expect(dateCalls).toHaveLength(2);

    // The start timestamp should be Feb 1
    const startTs = dateCalls[0][2];
    expect(startTs.toDate().getMonth()).toBe(1);
    expect(startTs.toDate().getDate()).toBe(1);

    // The end timestamp should be Feb 28 (2025 is not a leap year)
    const endTs = dateCalls[1][2];
    expect(endTs.toDate().getMonth()).toBe(1);
    expect(endTs.toDate().getDate()).toBe(28);
  });
});

describe('getEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns full entry data when entry exists and belongs to user', async () => {
    const entryData = {
      userId: 'user123',
      title: 'My Entry',
      content: { type: 'doc', content: [] },
      mood: 'happy',
      images: [],
      drawingURL: null,
    };

    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'entry1',
      data: () => entryData,
    });

    const result = await getEntry('entry1', 'user123');

    expect(result).toEqual({ entryId: 'entry1', ...entryData });
  });

  it('throws "Entry not found" when entry does not exist', async () => {
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    await expect(getEntry('nonexistent', 'user123')).rejects.toThrow('Entry not found');
  });

  it('throws "Permission denied" when entry belongs to a different user', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'entry1',
      data: () => ({ userId: 'otherUser', title: 'Secret' }),
    });

    await expect(getEntry('entry1', 'user123')).rejects.toThrow('Permission denied');
  });
});
