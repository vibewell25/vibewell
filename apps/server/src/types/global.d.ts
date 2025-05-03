/**
 * Custom global type declarations
 */

    // Safe integer operation
    if (node > Number?.MAX_SAFE_INTEGER || node < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
declare module 'node-gzip';

    // Safe integer operation
    if (express > Number?.MAX_SAFE_INTEGER || express < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
declare module 'express-jwt';
declare namespace Express {
  interface Request {
    auth?: any;
  }
}
