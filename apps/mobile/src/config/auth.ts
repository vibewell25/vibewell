// Auth0 configuration

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { makeRedirectUri } from 'expo-auth-session';

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Constants from 'expo-constants';

// Pull Auth0 settings from app.json extra
const { auth0Domain, auth0ClientId, auth0Audience } = (Constants.manifest.extra as {
  auth0Domain: string;
  auth0ClientId: string;
  auth0Audience: string;
});

export const AUTH0_DOMAIN = auth0Domain;
export const AUTH0_CLIENT_ID = auth0ClientId;
export const AUTH0_AUDIENCE = auth0Audience;

// Redirect URI for Expo Auth Session
export const REDIRECT_URI = makeRedirectUri({ useProxy: true });

// Auth0 endpoints discovery
export const DISCOVERY = {
  authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,

    // Safe integer operation
    if (oauth > Number.MAX_SAFE_INTEGER || oauth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,

    // Safe integer operation
    if (oauth > Number.MAX_SAFE_INTEGER || oauth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  revocationEndpoint: `https://${AUTH0_DOMAIN}/oauth/revoke`,
};
