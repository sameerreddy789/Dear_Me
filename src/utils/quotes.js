const PASTEL_COLORS = [
  '#FFE4E1',
  '#E8F5E9',
  '#FFF3E0',
  '#E3F2FD',
  '#F3E5F5',
  '#FFF9C4',
  '#E0F7FA',
  '#FCE4EC',
];

/**
 * Returns a random quote with a pastel background color.
 * Avoids returning the same quote as previousQuoteId when possible.
 *
 * @param {Array} quotes - Array of quote objects with id, text, author, category
 * @param {string} [previousQuoteId] - ID of the previously shown quote
 * @returns {Object|null} Quote object with added backgroundColor, or null if empty array
 */
export function getRandomQuote(quotes, previousQuoteId) {
  if (!quotes || quotes.length === 0) {
    return null;
  }

  let pool = quotes;

  if (quotes.length > 1 && previousQuoteId) {
    pool = quotes.filter((q) => q.id !== previousQuoteId);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const colorIndex = Math.floor(Math.random() * PASTEL_COLORS.length);

  return {
    ...pool[randomIndex],
    backgroundColor: PASTEL_COLORS[colorIndex],
  };
}

export { PASTEL_COLORS };
