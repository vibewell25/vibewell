import { authService } from './auth/authService';

// Re-export getCurrentUser for direct import
export const getCurrentUser = authService.getCurrentUser.bind(authService);
// Default export for backward compatibility
export default authService;
