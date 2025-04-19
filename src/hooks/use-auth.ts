/**
 * Auth hook that uses the standard Auth0 implementation
 * This file provides the primary auth hook for the application
 */

import { useAuth as useAuth0Context } from '@/contexts/auth-context';

export const useAuth = useAuth0Context;

export default useAuth; 