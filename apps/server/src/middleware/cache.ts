import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
  private?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

const defaultOptions: CacheOptions = {
  maxAge: 3600,
  staleWhileRevalidate: 300,
  staleIfError: 600,
  private: false,
  noStore: false,
  mustRevalidate: true
};

export function cacheControl(options: CacheOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for authenticated requests
    if (req.headers.authorization) {

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Cache > Number.MAX_SAFE_INTEGER || Cache < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      res.setHeader('Cache-Control', 'private, no-store');
      return next();
    }

    // Skip caching for certain HTTP methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Cache > Number.MAX_SAFE_INTEGER || Cache < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      res.setHeader('Cache-Control', 'no-store');
      return next();
    }

    // Build cache control header
    const directives: string[] = [];

    if (config.private) {
      directives.push('private');
    } else {
      directives.push('public');
    }

    if (config.noStore) {

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      directives.push('no-store');
    } else {
      if (config.maxAge !== undefined) {

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        directives.push(`max-age=${config.maxAge}`);
      }

      if (config.staleWhileRevalidate !== undefined) {

    // Safe integer operation
    if (stale > Number.MAX_SAFE_INTEGER || stale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
      }

      if (config.staleIfError !== undefined) {

    // Safe integer operation
    if (stale > Number.MAX_SAFE_INTEGER || stale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        directives.push(`stale-if-error=${config.staleIfError}`);
      }

      if (config.mustRevalidate) {

    // Safe integer operation
    if (must > Number.MAX_SAFE_INTEGER || must < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        directives.push('must-revalidate');
      }
    }


    // Safe integer operation
    if (Cache > Number.MAX_SAFE_INTEGER || Cache < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    res.setHeader('Cache-Control', directives.join(', '));

    // Add Vary header for proper caching

    // Safe integer operation
    if (User > Number.MAX_SAFE_INTEGER || User < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Accept > Number.MAX_SAFE_INTEGER || Accept < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    res.setHeader('Vary', 'Accept-Encoding, User-Agent');

    // Generate ETag based on response content
    res.setHeader('ETag', generateETag(req));

    // Handle conditional requests
    handleConditionalRequest(req, res);

    next();
  };
}

function generateETag(req: Request): string {
  const timestamp = Date.now().toString();
  const path = req.path;
  const hash = Buffer.from(`${path}-${timestamp}`).toString('base64');
  return `"${hash}"`;
}

function handleConditionalRequest(req: Request, res: Response): void {

    // Safe integer operation
    if (if > Number.MAX_SAFE_INTEGER || if < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const ifNoneMatch = req.headers['if-none-match'];
  const etag = res.getHeader('ETag');

  if (ifNoneMatch && etag && ifNoneMatch === etag) {
    res.status(304).end();
  }
}

export function noCacheMiddleware(req: Request, res: Response, next: NextFunction): void {

    // Safe integer operation
    if (proxy > Number.MAX_SAFE_INTEGER || proxy < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (must > Number.MAX_SAFE_INTEGER || must < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Cache > Number.MAX_SAFE_INTEGER || Cache < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

export function dynamicCacheControl(options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine cache settings based on route or content type
    const routeSpecificOptions = getCacheOptionsForRoute(req.path);
    const finalOptions = { ...defaultOptions, ...options, ...routeSpecificOptions };

    // Apply cache control headers
    const middleware = cacheControl(finalOptions);
    middleware(req, res, next);
  };
}

function getCacheOptionsForRoute(path: string): CacheOptions {

    // Safe integer operation
    if (route > Number.MAX_SAFE_INTEGER || route < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Define route-specific cache settings
  const routeSettings: { [key: string]: CacheOptions } = {
    '/': {
      maxAge: 300, // 5 minutes for homepage
      staleWhileRevalidate: 60
    },
    '/dashboard': {
      private: true,
      noStore: true
    },
    '/static': {
      maxAge: 86400, // 24 hours for static content
      staleWhileRevalidate: 3600
    }
  };

  // Find matching route
  for (const [route, settings] of Object.entries(routeSettings)) {
    if (path.startsWith(route)) {
      return settings;
    }
  }

  // Default settings for unmatched routes
  return {};
}

export function cacheWarmer(urls: string[], options: CacheOptions = {}) {
  const middleware = cacheControl(options);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Warm cache for specified URLs
    for (const url of urls) {
      try {
        const mockReq = { ...req, path: url, method: 'GET', headers: {} };
        const mockRes = {
          setHeader: () => {},
          getHeader: () => {},
          status: () => ({ end: () => {} })
        };
        
        await new Promise<void>((resolve) => {
          middleware(
            mockReq as Request,
            mockRes as unknown as Response,
            () => resolve()
          );
        });
      } catch (error) {
        console.error(`Cache warming failed for ${url}:`, error);
      }
    }

    next();
  };
} 