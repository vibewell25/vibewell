/**
 * Authentication Type Guards
 *
 * This file provides type guard functions for validating user authentication
 * and role authorization. These guards help ensure proper type checking and
 * avoid undefined/null errors when working with user data.
 */

import { exists } from './type-guards';

/**
 * User type definition for authentication purposes
 */
export interface User {
  id: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Checks if a user object is valid and authenticated
 * @param user - The user object to check
 * @returns True if the user is valid and authenticated
 */
export function isAuthenticated(user: User | null | undefined): user is User {
  return exists(user) && exists(user.id);
}

/**
 * Checks if a user has a specific role
 * @param user - The user to check
 * @param role - The role to check for, can be a single role or array of roles
 * @returns True if the user has the specified role
 */
export function hasRole(user: User | null | undefined, role: string | string[]): boolean {
  if (!isAuthenticated(user) || !exists(user.roles)) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  return roles.some(r => user.roles!.includes(r));
}

/**
 * Checks if a user has all the specified roles
 * @param user - The user to check
 * @param roles - Array of roles that the user must have
 * @returns True if the user has all the specified roles
 */
export function hasAllRoles(user: User | null | undefined, roles: string[]): boolean {
  if (!isAuthenticated(user) || !exists(user.roles)) {
    return false;
  }

  return roles.every(role => user.roles!.includes(role));
}

/**
 * Checks if a user has at least one of the specified roles
 * @param user - The user to check
 * @param roles - Array of roles to check against
 * @returns True if the user has at least one of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, roles: string[]): boolean {
  return hasRole(user, roles);
}

/**
 * Checks if a user has permission to access a resource
 * @param user - The user to check
 * @param permission - The permission to check for
 * @param resource - Optional resource identifier to check permission against
 * @returns True if the user has the specified permission
 */
export function hasPermission(
  user: User | null | undefined,
  permission: string,
  resource?: string
): boolean {
  if (!isAuthenticated(user) || !exists(user.permissions)) {
    return false;
  }

  // Simple implementation - can be extended based on your permission structure
  const userPermissions = user.permissions as string[];

  if (exists(resource)) {
    return userPermissions.includes(`${permission}:${resource}`);
  }

  return userPermissions.includes(permission);
}

/**
 * Gets user roles safely
 * @param user - The user to check
 * @returns Array of user roles or empty array if none exist
 */
export function getUserRoles(user: User | null | undefined): string[] {
  if (!isAuthenticated(user) || !exists(user.roles)) {
    return [];
  }

  return user.roles;
}

/**
 * Safely gets a user property with proper type checking
 * @param user - The user object
 * @param property - The property name to retrieve
 * @param defaultValue - Default value to return if property doesn't exist
 * @returns The property value or default value
 */
export function getUserProperty<T>(
  user: User | null | undefined,
  property: string,
  defaultValue: T
): T {
  if (!isAuthenticated(user)) {
    return defaultValue;
  }

  return (property in user ? user[property] : defaultValue) as T;
}
