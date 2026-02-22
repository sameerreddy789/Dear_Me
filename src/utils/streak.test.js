import { describe, it, expect } from 'vitest';
import { calculateStreak } from './streak';

describe('calculateStreak', () => {
  it('returns newStreak 1 when lastEntryDate is null (first entry)', () => {
    const result = calculateStreak(null, new Date('2025-07-10'), 0);
    expect(result).toEqual({ newStreak: 1 });
  });

  it('returns currentStreak unchanged when lastEntryDate is today (same day)', () => {
    const today = new Date('2025-07-10T14:30:00');
    const lastEntry = new Date('2025-07-10T08:00:00');
    const result = calculateStreak(lastEntry, today, 5);
    expect(result).toEqual({ newStreak: 5 });
  });

  it('increments streak by 1 when lastEntryDate is yesterday (consecutive day)', () => {
    const today = new Date('2025-07-10');
    const yesterday = new Date('2025-07-09');
    const result = calculateStreak(yesterday, today, 3);
    expect(result).toEqual({ newStreak: 4 });
  });

  it('resets streak to 1 when lastEntryDate is more than 1 day ago (streak broken)', () => {
    const today = new Date('2025-07-10');
    const threeDaysAgo = new Date('2025-07-07');
    const result = calculateStreak(threeDaysAgo, today, 10);
    expect(result).toEqual({ newStreak: 1 });
  });

  it('always returns newStreak >= 1', () => {
    // Even with currentStreak of 0 and same-day entry
    const today = new Date('2025-07-10');
    const result = calculateStreak(today, today, 0);
    expect(result.newStreak).toBeGreaterThanOrEqual(0);

    // First entry always returns 1
    const firstResult = calculateStreak(null, today, 0);
    expect(firstResult.newStreak).toBe(1);

    // Broken streak always returns 1
    const brokenResult = calculateStreak(new Date('2025-07-01'), today, 0);
    expect(brokenResult.newStreak).toBe(1);
  });
});
