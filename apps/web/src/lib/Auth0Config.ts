import type { ConfigParameters } from '@auth0/nextjs-auth0';

export const auth0Config: ConfigParameters = {
  baseURL: process.env['AUTH0_BASE_URL'],
  issuerBaseURL: process.env['AUTH0_ISSUER_BASE_URL'],
  clientID: process.env['AUTH0_CLIENT_ID'],
  clientSecret: process.env['AUTH0_CLIENT_SECRET'],
  secret: process.env['AUTH0_SECRET'],
  routes: {

    callback: '/api/auth/callback',

    login: '/api/auth/login',

    logout: '/api/auth/logout',
session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    rolling: true,
    rollingDuration: 60 * 60, // 1 hour
authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
clientAuthMethod: 'client_secret_post',
