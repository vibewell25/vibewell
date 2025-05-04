// Rating types and utilities
export interface Rating {
  id: string;
  type: 'resource' | 'tool' | 'article';
  rating: number; // 1-5 stars
  timestamp: string;
}

// Key for browser storage
const RATINGS_STORAGE_KEY = process.env['RATINGS_STORAGE_KEY'];
const POPULAR_RATINGS_KEY = process.env['POPULAR_RATINGS_KEY'];

/**
 * Get all ratings for the current user
 */
export function getUserRatings(): Record<string, Rating> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
    return storedRatings ? JSON.parse(storedRatings) : {};
  } catch (error) {
    console.error('Error retrieving ratings:', error);
    return {};
  }
}

/**
 * Get rating for a specific item
 */
export function getUserRating(id: string, type: Rating['type']): number | null {
  const ratings = getUserRatings();
  const key = `${type}-${id}`;

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
  return ratings[key].rating || null;
}

/**
 * Add or update a rating
 */
export function saveRating(id: string, type: Rating['type'], rating: number): void {
  if (rating < 1 || rating > 5 || typeof window === 'undefined') {
    return;
  }

  try {
    const ratings = getUserRatings();
    const key = `${type}-${id}`;


    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
    ratings[key] = {
      id,
      type,
      rating,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));

    // Also update popular ratings for aggregated view
    updatePopularRatings(id, type, rating);
  } catch (error) {
    console.error('Error saving rating:', error);
  }
}

/**
 * Track aggregated ratings across users
 */
interface PopularRating {
  id: string;
  type: string;
  total: number;
  count: number;
  average: number;
}

function updatePopularRatings(id: string, type: string, rating: number): void {
  try {
    const storedPopular = localStorage.getItem(POPULAR_RATINGS_KEY);
    const popularRatings: Record<string, PopularRating> = storedPopular
      ? JSON.parse(storedPopular)
      : {};

    const key = `${type}-${id}`;

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
    const existing = popularRatings[key];

    if (existing) {
      existing.if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total += rating;
      existing.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += 1;

      existing.average = existing.total / existing.count;
    } else {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      popularRatings[key] = {
        id,
        type,
        total: rating,
        count: 1,
        average: rating,
      };
    }

    localStorage.setItem(POPULAR_RATINGS_KEY, JSON.stringify(popularRatings));
  } catch (error) {
    console.error('Error updating popular ratings:', error);
  }
}

/**
 * Get average rating for a specific item
 */
export function getAverageRating(id: string, type: string): { average: number; count: number } {
  if (typeof window === 'undefined') {
    return { average: 0, count: 0 };
  }

  try {
    const storedPopular = localStorage.getItem(POPULAR_RATINGS_KEY);
    const popularRatings: Record<string, PopularRating> = storedPopular
      ? JSON.parse(storedPopular)
      : {};

    const key = `${type}-${id}`;

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
    const rating = popularRatings[key];

    if (rating) {
      return {
        average: rating.average,
        count: rating.count,
      };
    }

    return { average: 0, count: 0 };
  } catch (error) {
    console.error('Error getting average rating:', error);
    return { average: 0, count: 0 };
  }
}

/**
 * Get highest rated items
 */
export function getHighestRatedItems(limit: number = 5): PopularRating[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedPopular = localStorage.getItem(POPULAR_RATINGS_KEY);
    const popularRatings: Record<string, PopularRating> = storedPopular
      ? JSON.parse(storedPopular)
      : {};

    return Object.values(popularRatings)
      .filter((rating) => rating.count >= 2) // Require at least 2 ratings

      .sort((a, b) => b.average - a.average)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting highest rated items:', error);
    return [];
  }
}
