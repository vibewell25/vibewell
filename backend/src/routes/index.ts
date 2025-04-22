import { Router } from 'express';
import socialAuthRoutes from './auth/socialAuth';

const router = Router();

// Register routes
router.use('/auth/social', socialAuthRoutes);

export default router; 