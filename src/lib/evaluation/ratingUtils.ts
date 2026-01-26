export const RATING_SCALE: Record<string, number> = {
  poor: 1,
  fair: 2,
  good: 3,
  veryGood: 4,
  excellent: 5,
};

/**
 * Convert rating strings to numeric values
 */
export function convertRatingsToNumbers(
  ratings: (string | null | undefined)[],
): number[] {
  return ratings
    .map((r) => (r ? RATING_SCALE[r] : null))
    .filter((r) => r !== null) as number[];
}

/**
 * Calculate overall rating from ratings array
 */
export function calculateOverallRating(
  ratings: (string | null | undefined)[],
): number | null {
  const numericRatings = convertRatingsToNumbers(ratings);

  if (numericRatings.length === 0) {
    return null;
  }

  const average =
    numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length;
  return Math.round(average * 10) / 10;
}

/**
 * Check if average rating meets minimum threshold
 */
export function meetsMinimumRating(
  ratings: (string | null | undefined)[],
  minRating: number,
): boolean {
  const numericRatings = convertRatingsToNumbers(ratings);

  if (numericRatings.length === 0) {
    return false;
  }

  const avgRating =
    numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length;
  return avgRating >= minRating;
}
