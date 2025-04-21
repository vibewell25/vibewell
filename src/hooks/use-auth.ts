/**
 * @deprecated This file is deprecated. Use the standardized hook from 'src/hooks/use-unified-auth.ts' instead.
 *
 * Example:
 * ```
 * import { useAuth } from '@/hooks/use-unified-auth';
 * ```
 *
 * This file will be removed in a future release.
 */

import { useAuth as useUnifiedAuth } from './use-unified-auth';

/**
 * Re-export the unified auth hook for backwards compatibility
 *
 * @deprecated Use useAuth from './use-unified-auth.ts' instead.
 */
export const useAuth = () => {
  console.warn(
    '[DEPRECATED] useAuth from src/hooks/use-auth.ts is deprecated. ' +
      'Please migrate to useAuth from src/hooks/use-unified-auth.ts'
  );

  return useUnifiedAuth();
};

export default useAuth;
