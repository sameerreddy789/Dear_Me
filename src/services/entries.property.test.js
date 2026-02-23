import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 1: Entry Ownership Isolation
 * getEntry(entryId, userId) returns data only if entry.userId === userId
 *
 * **Validates: Requirements 12.1, 12.2**
 */

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

import { getEntry } from './entries';
import { getDoc } from 'firebase/firestore';

// Arbitrary for non-empty user IDs (alphanumeric strings)
const arbUserId = fc.string({ minLength: 1, maxLength: 40, unit: 'grapheme' }).filter(s => s.trim().length > 0);
const arbEntryId = fc.string({ minLength: 1, maxLength: 40, unit: 'grapheme' }).filter(s => s.trim().length > 0);

describe('Entry Ownership Isolation (Property 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns entry data when the requesting userId matches the entry owner', async () => {
    await fc.assert(
      fc.asyncProperty(arbEntryId, arbUserId, async (entryId, ownerId) => {
        const entryData = {
          userId: ownerId,
          title: 'Test Entry',
          content: { type: 'doc', content: [] },
          mood: 'happy',
          images: [],
          drawingURL: null,
        };

        getDoc.mockResolvedValue({
          exists: () => true,
          id: entryId,
          data: () => entryData,
        });

        const result = await getEntry(entryId, ownerId);

        expect(result).toEqual({ entryId, ...entryData });
      }),
      { numRuns: 100 }
    );
  });

  it('throws Permission denied when the requesting userId differs from the entry owner', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbEntryId,
        arbUserId,
        arbUserId,
        async (entryId, ownerId, requesterId) => {
          // Ensure the requester is different from the owner
          fc.pre(ownerId !== requesterId);

          const entryData = {
            userId: ownerId,
            title: 'Private Entry',
            content: { type: 'doc', content: [] },
            mood: 'calm',
            images: [],
            drawingURL: null,
          };

          getDoc.mockResolvedValue({
            exists: () => true,
            id: entryId,
            data: () => entryData,
          });

          await expect(getEntry(entryId, requesterId)).rejects.toThrow('Permission denied');
        }
      ),
      { numRuns: 100 }
    );
  });
});
