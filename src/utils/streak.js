import { startOfDay, differenceInCalendarDays } from 'date-fns';

/**
 * Calculates the new streak value based on the last entry date.
 *
 * @param {Date | null} lastEntryDate - Date of the user's most recent entry, or null if first entry
 * @param {Date} currentDate - The current date (today)
 * @param {number} currentStreak - The user's current streak count (>= 0)
 * @returns {{ newStreak: number }} The calculated streak value (always >= 1)
 */
export function calculateStreak(lastEntryDate, currentDate, currentStreak) {
  if (lastEntryDate === null) {
    return { newStreak: 1 };
  }

  const lastDay = startOfDay(lastEntryDate);
  const today = startOfDay(currentDate);
  const diffInDays = differenceInCalendarDays(today, lastDay);

  if (diffInDays === 0) {
    // Already wrote today — no change
    return { newStreak: currentStreak };
  } else if (diffInDays === 1) {
    // Consecutive day — increment streak
    return { newStreak: currentStreak + 1 };
  } else {
    // Streak broken — reset to 1
    return { newStreak: 1 };
  }
}
