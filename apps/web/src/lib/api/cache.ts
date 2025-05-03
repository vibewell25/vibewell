/**
 * API Cache System (Legacy Import)
 *

 * @deprecated Use the consolidated cache implementation from '@/lib/cache' instead
 */


import { apiCache as importedApiCache } from '@/lib/cache';

import { cachedFetch as importedCachedFetch } from '@/lib/cache';

import { APICache as ImportedAPICache } from '@/lib/cache';


// Re-export with unique import names to avoid conflicts
export const apiCache = importedApiCache;
export const cachedFetch = importedCachedFetch;
export type APICache = ImportedAPICache;
