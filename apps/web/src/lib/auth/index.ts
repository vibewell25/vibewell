import { getSession, updateSession, withApiAuthRequired, withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { Session, User } from '@auth0/nextjs-auth0';
import { authConfig } from '@/config/auth';

// Extend the default User type to include custom properties
declare module '@auth0/nextjs-auth0' {
  interface User {
    roles?: string[];
    isAdmin?: boolean;
    isProvider?: boolean;
    isUser?: boolean;
/**
 * Helper function to check if a user has a specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  if (!user.roles) return false;
  return user.roles.includes(role);
/**
 * Helper function to check if a session is valid and has a user
 */
export function isAuthenticated(session: Session | null): session is Session & { user: User } {
  return !!session.user;
/**
 * Helper function to check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'admin');
/**
 * Helper function to check if a user is a provider
 */
export function isProvider(user: User | null | undefined): boolean {
  return hasRole(user, 'provider');
export {
  getSession,
  updateSession,
  withApiAuthRequired,
  withPageAuthRequired,
// Export everything as a unified auth service
export const authService = {
  getSession,
  updateSession,
  withApiAuthRequired,
  withPageAuthRequired,
  hasRole,
  isAuthenticated,
  isAdmin,
  isProvider,
export default authService; 