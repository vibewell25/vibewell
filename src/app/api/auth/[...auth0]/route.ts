import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
  }),
  callback: handleCallback({
    afterCallback: (req, res, session) => {
      // You can modify the session here if needed
      return session;
    },
  }),
  // Other handlers are automatically provided by handleAuth()
});

export const POST = handleAuth();
