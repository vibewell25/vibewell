export interface ServiceCredentials {
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  [key: string]: string | undefined;
export interface AuthConfig {
  provider: 'custom' | 'firebase' | 'auth0' | 'cognito';
  apiBaseUrl: string;
  credentials: ServiceCredentials;
  options?: {
    region?: string;
    userPoolId?: string;
    [key: string]: string | undefined;
export interface ServiceConfig {
  enabled: boolean;
  credentials: ServiceCredentials;
  options?: Record<string, any>;
