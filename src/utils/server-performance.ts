/**
 * Server Performance Optimization Utilities
 *
 * This file contains utilities to optimize server-side rendering performance
 * for Next.js applications.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

// Cache control header options
export interface CacheControlOptions {
  maxAge?: number; // Seconds browser should cache response
  staleWhileRevalidate?: number; // Seconds to serve stale content while fetching new
  public?: boolean; // Can be cached by intermediate caches
  immutable?: boolean; // Content will never change
  noStore?: boolean; // Don't cache at all
  mustRevalidate?: boolean; // Must revalidate when stale
}

/**
 * Apply cache control headers for static/dynamic content
 * Useful for API routes and getServerSideProps
 */
export function setCacheControl(
  res: NextApiResponse | GetServerSidePropsContext['res'],
  options: CacheControlOptions = {},
): void {
  const {
    maxAge = 0,
    staleWhileRevalidate = 0,
    public: isPublic = false,
    immutable = false,
    noStore = false,
    mustRevalidate = false,
  } = options;

  // Build cache control header value
  let cacheControl = '';

  if (noStore) {
    cacheControl = 'no-store, no-cache, max-age=0, must-revalidate';
  } else {
    cacheControl = [
      isPublic ? 'public' : 'private',
      `max-age=${maxAge}`,
      staleWhileRevalidate > 0 ? `stale-while-revalidate=${staleWhileRevalidate}` : '',
      immutable ? 'immutable' : '',
      mustRevalidate ? 'must-revalidate' : '',
    ]
      .filter(Boolean)
      .join(', ');
  }

  res.setHeader('Cache-Control', cacheControl);
}

/**
 * Apply static generation cache control (long cache with revalidation)
 * Useful for pages that can be static most of the time but need occasional updates
 */
export function setStaticCache(
  res: NextApiResponse | GetServerSidePropsContext['res'],
  maxAgeSeconds: number = 60 * 60, // 1 hour default
  staleWhileRevalidateSeconds: number = 60 * 60 * 24, // 1 day default
): void {
  setCacheControl(res, {
    maxAge: maxAgeSeconds,
    staleWhileRevalidate: staleWhileRevalidateSeconds,
    public: true,
  });
}

/**
 * Apply dynamic content cache control (short cache with revalidation)
 * Useful for frequently changing content that can still benefit from short caching
 */
export function setDynamicCache(
  res: NextApiResponse | GetServerSidePropsContext['res'],
  maxAgeSeconds: number = 10, // 10 seconds default
  staleWhileRevalidateSeconds: number = 60, // 1 minute default
): void {
  setCacheControl(res, {
    maxAge: maxAgeSeconds,
    staleWhileRevalidate: staleWhileRevalidateSeconds,
    public: true,
  });
}

/**
 * Apply no-cache control for user-specific or rapidly changing content
 * Useful for personalized or real-time content
 */
export function setNoCache(res: NextApiResponse | GetServerSidePropsContext['res']): void {
  setCacheControl(res, { noStore: true });
}

/**
 * HOC for getServerSideProps to apply cache control optimizations
 *
 * @param getServerSideProps - Original getServerSideProps function
 * @param cacheOptions - Cache control options
 * @returns Enhanced getServerSideProps function with caching
 */
export function withCaching(
  getServerSideProps: (
    context: GetServerSidePropsContext,
  ) => Promise<GetServerSidePropsResult<any>>,
  cacheOptions: CacheControlOptions,
) {
  return async (context: GetServerSidePropsContext) => {
    // Apply cache control headers
    setCacheControl(context.res, cacheOptions);

    // Call the original getServerSideProps
    return await getServerSideProps(context);
  };
}

/**
 * HOC for API routes to apply cache control optimizations
 *
 * @param handler - Original API route handler
 * @param cacheOptions - Cache control options
 * @returns Enhanced API handler with caching
 */
export function withApiCaching(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  cacheOptions: CacheControlOptions,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply cache control headers
    setCacheControl(res, cacheOptions);

    // Call the original handler
    return await handler(req, res);
  };
}

/**
 * Set response headers to improve Core Web Vitals
 * by preloading critical resources
 */
export function setCoreWebVitalsHeaders(
  res: NextApiResponse | GetServerSidePropsContext['res'],
  criticalAssets: { href: string; as: string; crossOrigin?: string }[] = [],
): void {
  // Set preload headers for critical assets
  criticalAssets.forEach(({ href, as, crossOrigin }) => {
    res.setHeader(
      'Link',
      `<${href}>; rel=preload; as=${as}${crossOrigin ? `; crossorigin=${crossOrigin}` : ''}`,
    );
  });

  // Enable server push for HTTP/2 (if supported)
  res.setHeader('X-HTTP2-Push', criticalAssets.map(({ href }) => href).join(', '));
}

/**
 * Example usage:
 *
 * // In getServerSideProps:
 * export const getServerSideProps = withCaching(
 *   async (context) => {
 *     // Your original getServerSideProps logic
 *     return { props: { data } };
 *   },
 *   { maxAge: 60, staleWhileRevalidate: 600, public: true }
 * );
 *
 * // In API route:
 * export default withApiCaching(
 *   async (req, res) => {
 *     // Your original API route logic
 *     res.json({ data });
 *   },
 *   { maxAge: 30, staleWhileRevalidate: 300, public: true }
 * );
 */
