import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          screen_hint: req.query.screen_hint as string,
        },
      });
    } catch (error: any) {
      res.status(error.status || 500).end(error.message);
    }
  },
});
