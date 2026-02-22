import { describe, it, expect } from 'vitest';
import {
  validateTitle,
  validateMood,
  validateImages,
  validateEntryDate,
  validateEntryInput,
} from './validation';

describe('validateTitle', () => {
  it('accepts a valid title', () => {
    expect(validateTitle('My Day')).toEqual({ valid: true });
  });

  it('rejects an empty string', () => {
    const result = validateTitle('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects a whitespace-only string', () => {
    const result = validateTitle('   ');
    expect(result.valid).toBe(false);
  });

  it('rejects a title exceeding 200 characters', () => {
    const result = validateTitle('a'.repeat(201));
    expect(result.valid).toBe(false);
  });

  it('accepts a title of exactly 200 characters', () => {
    expect(validateTitle('a'.repeat(200))).toEqual({ valid: true });
  });

  it('rejects non-string values', () => {
    expect(validateTitle(null).valid).toBe(false);
    expect(validateTitle(undefined).valid).toBe(false);
    expect(validateTitle(123).valid).toBe(false);
  });
});

describe('validateMood', () => {
  it.each(['happy', 'sad', 'productive', 'romantic', 'anxious', 'calm', 'neutral'])(
    'accepts valid mood: %s',
    (mood) => {
      expect(validateMood(mood)).toEqual({ valid: true });
    }
  );

  it('rejects an invalid mood', () => {
    expect(validateMood('excited').valid).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateMood(undefined).valid).toBe(false);
  });
});

describe('validateImages', () => {
  it('accepts an empty array', () => {
    expect(validateImages([])).toEqual({ valid: true });
  });

  it('accepts an array of valid URL strings', () => {
    expect(validateImages(['https://example.com/img.png'])).toEqual({ valid: true });
  });

  it('rejects an array with more than 10 items', () => {
    const images = Array.from({ length: 11 }, (_, i) => `https://img${i}.png`);
    expect(validateImages(images).valid).toBe(false);
  });

  it('accepts exactly 10 images', () => {
    const images = Array.from({ length: 10 }, (_, i) => `https://img${i}.png`);
    expect(validateImages(images)).toEqual({ valid: true });
  });

  it('rejects an array containing an empty string', () => {
    expect(validateImages(['']).valid).toBe(false);
  });

  it('rejects non-array values', () => {
    expect(validateImages('not-array').valid).toBe(false);
  });
});

describe('validateEntryDate', () => {
  it('accepts a past date', () => {
    expect(validateEntryDate(new Date('2024-01-01'))).toEqual({ valid: true });
  });

  it('accepts the current date (now)', () => {
    expect(validateEntryDate(new Date())).toEqual({ valid: true });
  });

  it('rejects a future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateEntryDate(future).valid).toBe(false);
  });

  it('rejects an invalid Date object', () => {
    expect(validateEntryDate(new Date('invalid')).valid).toBe(false);
  });

  it('rejects non-Date values', () => {
    expect(validateEntryDate('2024-01-01').valid).toBe(false);
    expect(validateEntryDate(null).valid).toBe(false);
  });
});

describe('validateEntryInput', () => {
  const validInput = {
    title: 'My Day',
    mood: 'happy',
    images: [],
    date: new Date(),
  };

  it('accepts a fully valid input', () => {
    expect(validateEntryInput(validInput)).toEqual({ valid: true });
  });

  it('returns errors for invalid title and mood', () => {
    const result = validateEntryInput({ ...validInput, title: '', mood: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });

  it('defaults images to empty array if missing', () => {
    const { images, ...rest } = validInput;
    expect(validateEntryInput(rest)).toEqual({ valid: true });
  });

  it('returns errors for null input', () => {
    const result = validateEntryInput(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
