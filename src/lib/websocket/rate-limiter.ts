/**
 * WebSocket Rate Limiter (Legacy Import)
 *
 * @deprecated Use the consolidated rate limiter from '@/lib/rate-limiter' instead
 */

import { webSocketRateLimiter, WebSocketRateLimiter } from '@/lib/rate-limiter';

// Re-export the consolidated implementations
export { webSocketRateLimiter, WebSocketRateLimiter };
