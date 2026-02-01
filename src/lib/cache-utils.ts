/**
 * Cache utility functions for clearing SWR cache
 */

/**
 * Clear all SWR cache
 * This is used when users log out or switch accounts to prevent data leakage
 */
export function clearAllCache(): void {
  // Clear localStorage cache if any
  if (typeof window !== 'undefined') {
    try {
      // Clear any cached data in localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('swr-') || key.startsWith('$swr$')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
}
