import {
  doc,
  collection,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateStreak } from '../utils/streak';
import { validateEntryInput } from '../utils/validation';

/**
 * Saves a diary entry using a Firestore transaction for atomicity.
 * Creates a new entry or updates an existing one.
 * For new entries, recalculates and updates the user's streak.
 *
 * @param {string} userId - The authenticated user's UID
 * @param {object} input - The diary entry input (title, content, mood, images, drawingURL, theme, date)
 * @param {string} [existingEntryId] - If provided, updates the existing entry instead of creating a new one
 * @returns {Promise<string>} The entry's Firestore document ID
 */
export async function saveEntry(userId, input, existingEntryId) {
  // Validate input before saving
  const validation = validateEntryInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const now = Timestamp.now();

  const entryData = {
    userId,
    date: Timestamp.fromDate(input.date),
    title: input.title.trim(),
    content: input.content,
    mood: input.mood,
    images: input.images ?? [],
    drawingURL: input.drawingURL ?? null,
    theme: input.theme,
    updatedAt: now,
  };

  let entryId;

  await runTransaction(db, async (transaction) => {
    if (existingEntryId) {
      // Update existing entry
      const entryRef = doc(db, 'entries', existingEntryId);
      const existingEntry = await transaction.get(entryRef);

      if (!existingEntry.exists()) {
        throw new Error('Entry not found');
      }
      if (existingEntry.data().userId !== userId) {
        throw new Error('Permission denied');
      }

      transaction.update(entryRef, entryData);
      entryId = existingEntryId;
    } else {
      // Create new entry
      const entryRef = doc(collection(db, 'entries'));
      transaction.set(entryRef, {
        ...entryData,
        createdAt: now,
      });
      entryId = entryRef.id;

      // Update streak only for new entries
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const lastEntryDate = userData.lastEntryDate?.toDate() ?? null;
      const currentStreak = userData.streak ?? 0;
      const currentLongest = userData.longestStreak ?? 0;

      const { newStreak } = calculateStreak(lastEntryDate, input.date, currentStreak);

      transaction.update(userRef, {
        streak: newStreak,
        longestStreak: Math.max(currentLongest, newStreak),
        lastEntryDate: Timestamp.fromDate(input.date),
      });
    }
  });

  return entryId;
}
