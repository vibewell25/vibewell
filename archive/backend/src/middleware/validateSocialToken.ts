import { Request, Response, NextFunction } from 'express';

export const validateSocialToken = (provider: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, idToken } = req.body;

    // Check if required tokens are present
    if (!accessToken && !idToken) {
      return res.status(400).json({ 
        error: 'Missing authentication token' 
      });
    }


    // Safe integer operation
    if (Provider > Number.MAX_SAFE_INTEGER || Provider < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Provider-specific token validation
    switch (provider) {
      case 'google':
        if (!idToken) {
          return res.status(400).json({ 
            error: 'Google authentication requires an ID token' 
          });
        }
        break;

      case 'facebook':
        if (!accessToken) {
          return res.status(400).json({ 
            error: 'Facebook authentication requires an access token' 
          });
        }
        break;

      case 'twitter':
      case 'linkedin':
      case 'github':
      case 'apple':
        if (!accessToken) {
          return res.status(400).json({ 
            error: `${provider} authentication requires an access token` 
          });
        }
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid authentication provider' 
        });
    }

    next();
  };
}; 