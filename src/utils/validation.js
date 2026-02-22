import { MOODS, MAX_IMAGES, MAX_TITLE_LENGTH } from '../constants';

/**
 * Validates a diary entry title.
 * Title must be 1–200 characters, non-empty after trim.
 */
export function validateTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or less` };
  }
  return { valid: true };
}

/**
 * Validates a mood value.
 * Must be one of the 7 valid Mood values from MOODS constant.
 */
export function validateMood(mood) {
  if (!MOODS.includes(mood)) {
    return { valid: false, error: `Mood must be one of: ${MOODS.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validates an images array.
 * Array length must be ≤ 10, each item must be a non-empty string.
 */
export function validateImages(images) {
  if (!Array.isArray(images)) {
    return { valid: false, error: 'Images must be an array' };
  }
  if (images.length > MAX_IMAGES) {
    return { valid: false, error: `Maximum ${MAX_IMAGES} images allowed` };
  }
  for (let i = 0; i < images.length; i++) {
    if (typeof images[i] !== 'string' || images[i].trim().length === 0) {
      return { valid: false, error: `Image at index ${i} must be a non-empty string` };
    }
  }
  return { valid: true };
}

/**
 * Validates an entry date.
 * Date must not be in the future (compared with new Date()).
 */
export function validateEntryDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: 'Date must be a valid Date object' };
  }
  if (date > new Date()) {
    return { valid: false, error: 'Entry date cannot be in the future' };
  }
  return { valid: true };
}

/**
 * Validates all fields of a diary entry input.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
export function validateEntryInput(input) {
  const errors = [];

  const titleResult = validateTitle(input?.title);
  if (!titleResult.valid) errors.push(titleResult.error);

  const moodResult = validateMood(input?.mood);
  if (!moodResult.valid) errors.push(moodResult.error);

  const imagesResult = validateImages(input?.images ?? []);
  if (!imagesResult.valid) errors.push(imagesResult.error);

  const dateResult = validateEntryDate(input?.date);
  if (!dateResult.valid) errors.push(dateResult.error);

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}
