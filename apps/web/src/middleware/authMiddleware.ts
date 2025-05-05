import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession, type Session, type UserProfile } from '@auth0/nextjs-auth0';
import { logger } from '@/lib/logger';

// Custom roles available in the system
export type UserRole = 'admin' | 'provider' | 'user' | 'guest';

// Extended user profile with role information
export interface ExtendedUserProfile extends UserProfile {
  roles?: string[];
  isAdmin?: boolean;
  isProvider?: boolean;
  isUser?: boolean;
// Extended session with the extended user profile
export interface ExtendedSession extends Session {
  user: ExtendedUserProfile;
/**
 * Higher-order function to wrap API handlers with authentication
 * 
 * @param handler - The API handler to protect
 * @param options - Options for authentication, including required roles
 * @returns A wrapped handler that checks authentication before proceeding
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options: { requiredRoles?: UserRole[] } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the user's session
      const session = await getSession(req, res);

      // If no session exists and authentication is required, return 401
      if (!session || !session.user) {
        logger.warn('Unauthorized access attempt', {
          path: req.url,
          method: req.method,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
return res.status(401).json({ error: 'Unauthorized: Authentication required' });
// Check if roles are required
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        // Enhance session with role information from Auth0
        const extendedSession = session as ExtendedSession;
        const user = extendedSession.user;
        
        // Get user roles from Auth0 user metadata (using Auth0 namespace)
        const userRoles = user.roles || [];
        
        // Flag user roles for easier access
        user.isAdmin = userRoles.includes('admin');
        user.isProvider = userRoles.includes('provider');
        user.isUser = userRoles.includes('user');
        
        // Check if user has any of the required roles
        const hasRequiredRole = options.requiredRoles.some(role => 
          (role === 'admin' && user.isAdmin) ||
          (role === 'provider' && user.isProvider) ||
          (role === 'user' && user.isUser) ||
          (role === 'guest') // Everyone has at least guest access
if (!hasRequiredRole) {
          logger.warn('Insufficient permissions', {
            userId: user.sub,
            path: req.url,
            method: req.method,
            requiredRoles: options.requiredRoles,
            userRoles,
return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
// Add user ID to headers for rate limiting
      if (session.user.sub) {
        req.headers['x-user-id'] = session.user.sub;
// All checks passed, proceed to the handler
      return handler(req, res);
catch (error) {
      logger.error('Authentication error', {
        path: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
return res.status(500).json({ error: 'Internal server error during authentication' });
/**
 * Check if a session has a specific role
 * @param session - User session
 * @param role - The role to check
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  if (!session.user) return false;
  
  const extendedSession = session as ExtendedSession;
  const user = extendedSession.user;
  
  // Get user roles from Auth0 user metadata
  const userRoles = user.roles || [];
  
  // Check for specific roles
  if (role === 'admin') return userRoles.includes('admin');
  if (role === 'provider') return userRoles.includes('provider');
  if (role === 'user') return userRoles.includes('user');
  if (role === 'guest') return true; // Everyone has at least guest access
  
  return false;
/**
 * Middleware for Next.js App Router to require specific roles
 */
export function requireRoles(roles: UserRole[]) {
  return async (req: Request) => {
    const session = await getSession();
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
// Check if user has any of the required roles
    const hasPermission = roles.some(role => hasRole(session, role));
    
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
// Continue to the next middleware or route handler
    return null;
// Pre-configured middleware for common role requirements
export const requireAdmin = requireRoles(['admin']);
export const requireProvider = requireRoles(['admin', 'provider']);
export const requireUser = requireRoles(['admin', 'provider', 'user']);
export const requireAuth = withAuth; // Just requires authentication, no specific roles 