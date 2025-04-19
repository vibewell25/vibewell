/**
 * @deprecated Use useAuth from '../hooks/use-unified-auth' instead.
 * 
 * This file is maintained for backward compatibility only.
 * It will be removed in a future version.
 */

import { 
  useAuth, 
  AuthHelpers, 
  UserRole, 
  getAuthState, 
  checkUserRole,
  isAuthenticated
} from './use-unified-auth';

// Show deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Warning: Importing from unified-auth.ts is deprecated. ' +
    'Use use-unified-auth.ts instead.'
  );
}

export { 
  AuthHelpers, 
  UserRole, 
  getAuthState, 
  checkUserRole,
  isAuthenticated
};

export default useAuth; 