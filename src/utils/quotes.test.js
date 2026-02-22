import { describe, it, expect } from 'vitest';
import { getRandomQuote, PASTEL_COLORS } from './quotes';

const sampleQuotes = [
  { id: 'q1', text: 'Quote one', author: 'Author A', category: 'motivation' },
  { id: 'q2', text: 'Quote two', author: 'Author B', category: 'love' },
  { id: 'q3', text: 'Quote three', author: 'Author C', category: 'self-care' },
];

describe('getRandomQuote', () => {
  it('returns null for an empty array', () => {
    expect(getRandomQuote([], 'q1')).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(getRandomQuote(null)).toBeNull();
    expect(getRandomQuote(undefined)).toBeNull();
  });

  it('returns the single quote regardless of previousQuoteId', () => {
    const single = [{ id: 'q1', text: 'Only one', author: 'A', category: 'general' }];
    const result = getRandomQuote(single, 'q1');
    expect(result.id).toBe('q1');
    expect(result.text).toBe('Only one');
    expect(result).toHaveProperty('backgroundColor');
  });

  it('returns a quote with a valid pastel backgroundColor', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(result).not.toBeNull();
    expect(PASTEL_COLORS).toContain(result.backgroundColor);
  });

  it('preserves all original quote fields', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('author');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('backgroundColor');
  });

  it('does not mutate the input quotes array', () => {
    const original = [...sampleQuotes];
    getRandomQuote(sampleQuotes, 'q1');
    expect(sampleQuotes).toEqual(original);
  });

  it('never returns the previous quote when multiple quotes exist', () => {
    const previousId = 'q1';
    // Run many times to gain confidence in non-repetition
    for (let i = 0; i < 100; i++) {
      const result = getRandomQuote(sampleQuotes, previousId);
      expect(result.id).not.toBe(previousId);
    }
  });

  it('works without previousQuoteId', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(result).not.toBeNull();
    expect(sampleQuotes.map((q) => q.id)).toContain(result.id);
  });
});
