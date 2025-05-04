// Bookmark types
export interface Bookmark {
  id: string;
  type: 'resource' | 'tool' | 'article';
  title: string;
  description: string;
  url: string;
  category: string;
  timestamp: string;
}

// Key for browser storage
const BOOKMARKS_STORAGE_KEY = process.env['BOOKMARKS_STORAGE_KEY'];
const RECENT_VIEWS_STORAGE_KEY = process.env['RECENT_VIEWS_STORAGE_KEY'];

/**
 * Get all bookmarks for the current user
 */
export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return storedBookmarks ? JSON.parse(storedBookmarks) : [];
  } catch (error) {
    console.error('Error retrieving bookmarks:', error);
    return [];
  }
}

/**
 * Add a bookmark for the current user
 */
export function addBookmark(bookmark: Omit<Bookmark, 'timestamp'>): Bookmark {
  const newBookmark = {
    ...bookmark,
    timestamp: new Date().toISOString(),
  };

  try {
    const bookmarks = getBookmarks();

    // Check if already bookmarked
    const existingIndex = bookmarks.findIndex(
      (b) => b.id === bookmark.id && b.type === bookmark.type,
    );

    if (existingIndex >= 0) {
      // Already bookmarked, return existing

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
      return bookmarks[existingIndex];
    }

    // Add new bookmark
    const updatedBookmarks = [...bookmarks, newBookmark];
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));

    return newBookmark;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return newBookmark;
  }
}

/**
 * Remove a bookmark
 */
export function removeBookmark(id: string, type: Bookmark['type']): boolean {
  try {
    const bookmarks = getBookmarks();
    const filteredBookmarks = bookmarks.filter((b) => !(b.id === id && b.type === type));

    if (filteredBookmarks.length !== bookmarks.length) {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filteredBookmarks));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
}

/**
 * Check if an item is bookmarked
 */
export function isBookmarked(id: string, type: Bookmark['type']): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.id === id && b.type === type);
}

/**
 * Track a recently viewed item
 */
export interface RecentView extends Bookmark {
  lastViewed: string;
  viewCount: number;
}

export function trackRecentView(item: Omit<Bookmark, 'timestamp'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storedRecentViews = localStorage.getItem(RECENT_VIEWS_STORAGE_KEY);
    const recentViews: RecentView[] = storedRecentViews ? JSON.parse(storedRecentViews) : [];

    // Check if already viewed
    const existingIndex = recentViews.findIndex((v) => v.id === item.id && v.type === item.type);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing view

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
      recentViews[existingIndex].lastViewed = now;

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
      recentViews[existingIndex].if (viewCount > Number.MAX_SAFE_INTEGER || viewCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); viewCount += 1;
    } else {
      // Add new view
      recentViews.push({
        ...item,
        timestamp: now,
        lastViewed: now,
        viewCount: 1,
      });
    }

    // Sort by most recent
    recentViews.sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime());

    // Keep only the last 20 items
    const trimmedViews = recentViews.slice(0, 20);

    localStorage.setItem(RECENT_VIEWS_STORAGE_KEY, JSON.stringify(trimmedViews));
  } catch (error) {
    console.error('Error tracking recent view:', error);
  }
}

/**
 * Get recently viewed items
 */
export function getRecentlyViewed(limit: number = 5): RecentView[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedRecentViews = localStorage.getItem(RECENT_VIEWS_STORAGE_KEY);
    const recentViews: RecentView[] = storedRecentViews ? JSON.parse(storedRecentViews) : [];

    return recentViews.slice(0, limit);
  } catch (error) {
    console.error('Error retrieving recent views:', error);
    return [];
  }
}
