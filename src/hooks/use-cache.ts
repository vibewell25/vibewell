'use client';

import { useState, useEffect } from 'react';

interface CacheOptions {
  maxSize?: number;
  expirationTime?: number;
}

export function useCache(options: CacheOptions = {}) {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    expirationTime = 24 * 60 * 60 * 1000, // 24 hours default
  } = options;

  const getCachedModel = async (url: string): Promise<Uint8Array | null> => {
    try {
      const cache = await caches.open('model-cache');
      const response = await cache.match(url);

      if (!response) return null;

      const data = await response.json();
      if (Date.now() - data.timestamp > expirationTime) {
        await cache.delete(url);
        return null;
      }

      return new Uint8Array(data.model);
    } catch (error) {
      console.error('Error getting cached model:', error);
      return null;
    }
  };

  const cacheModel = async (url: string, model: Uint8Array): Promise<void> => {
    try {
      const cache = await caches.open('model-cache');
      const data = {
        model: Array.from(model),
        timestamp: Date.now(),
      };

      await cache.put(url, new Response(JSON.stringify(data)));
    } catch (error) {
      console.error('Error caching model:', error);
    }
  };

  return { getCachedModel, cacheModel };
}
