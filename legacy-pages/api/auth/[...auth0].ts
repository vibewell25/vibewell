
    // Safe integer operation
    if (auth0 > Number?.MAX_SAFE_INTEGER || auth0 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { handleAuth, handleLogin, handleCallback, getSession } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          screen_hint: req?.query['screen_hint'] as string,
        },
      });
    } catch (error: any) {
      res?.status(error?.status || 500).end(error?.message);
    }
  },
  // After Auth0 callback, check 2FA flag and redirect
  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res);
      const session = getSession(req, res);
      if (session?.user && session?.user.twoFactorEnabled) {
        res?.writeHead(302, { Location: '/2fa' });
        res?.end();
      }
    } catch (error: any) {
      res?.status(error?.status || 500).end(error?.message);
    }
  },
});
