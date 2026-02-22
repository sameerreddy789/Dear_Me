import {
  doc,
  collection,
  runTransaction,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateStreak } from '../utils/streak';
import { validateEntryInput } from '../utils/validation';
import { startOfMonth, endOfMonth } from 'date-fns';

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

/**
 * Retrieves diary entry summaries for a given month.
 * Queries Firestore for entries belonging to the user within the specified month,
 * sorted by date ascending.
 *
 * @param {string} userId - The authenticated user's UID
 * @param {number} year - The 4-digit year
 * @param {number} month - The month (0-indexed, JavaScript Date convention)
 * @returns {Promise<Array<{entryId: string, date: Date, title: string, mood: string}>>}
 */
export async function getEntriesForMonth(userId, year, month) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const startTimestamp = Timestamp.fromDate(monthStart);
  const endTimestamp = Timestamp.fromDate(monthEnd);

  const entriesRef = collection(db, 'entries');
  const q = query(
    entriesRef,
    where('userId', '==', userId),
    where('date', '>=', startTimestamp),
    where('date', '<=', endTimestamp),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      entryId: docSnap.id,
      date: data.date.toDate(),
      title: data.title,
      mood: data.mood,
    };
  });
}

/**
 * Retrieves a single diary entry by ID, verifying ownership.
 * Throws an error if the entry does not exist or does not belong to the user.
 *
 * @param {string} entryId - The Firestore document ID of the entry
 * @param {string} userId - The authenticated user's UID
 * @returns {Promise<object>} The full entry data including entryId
 */
export async function getEntry(entryId, userId) {
  const entryRef = doc(db, 'entries', entryId);
  const entrySnap = await getDoc(entryRef);

  if (!entrySnap.exists()) {
    throw new Error('Entry not found');
  }

  const data = entrySnap.data();

  if (data.userId !== userId) {
    throw new Error('Permission denied');
  }

  return {
    entryId: entrySnap.id,
    ...data,
  };
}
