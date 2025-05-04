import { Router } from 'express';

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import socialAuthRoutes from './auth/socialAuth';

const router = Router();

// Register routes

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.use('/auth/social', socialAuthRoutes);

export default router; 