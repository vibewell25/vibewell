import { Router } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router = Router();

// Get or create user based on Auth0 JWT
router.get('/me', checkJwt, async (req, res) => {
  try {
    // Extract Auth0 user info from token
    const auth = req.auth as any;
    const auth0Id: string = auth.sub;
    const email: string = auth.email;
    const name: string = auth.name;
    const picture: string | undefined = auth.picture;

    // Find existing user
    let user = await prisma.user.findUnique({ where: { auth0Id } });
    if (!user) {
      // Create new user record
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
          avatar: picture,
        },
      });
    }
    // Respond with user profile
    res.json({ user });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
