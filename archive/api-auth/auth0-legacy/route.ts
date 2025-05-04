
import { handleAuth } from '@auth0/nextjs-auth0';

/**

 * Auth0 API route handler

 * Handles all Auth0 related routes (/api/auth/*)


 * @see https://auth0.github.io/nextjs-auth0/modules/handlers_auth.html
 */
export const GET = handleAuth(); 