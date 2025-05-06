import { AuthConfig, ServiceConfig } from '@/types/third-party';

interface ThirdPartyConfig {
  auth: AuthConfig;
  analytics?: ServiceConfig;
  payment?: ServiceConfig;
  storage?: ServiceConfig;
  messaging?: ServiceConfig;
  search?: ServiceConfig;
  logging?: ServiceConfig;
  ai?: ServiceConfig;
export class ThirdPartyManager {
  private static instance: ThirdPartyManager;
  private config: ThirdPartyConfig;

  private constructor() {
    // Initialize with default config
    this.config = {
      auth: {
        provider: 'custom',
        apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
        credentials: {
          apiKey: process.env.AUTH_API_KEY,
          apiSecret: process.env.AUTH_API_SECRET
public static getInstance(): ThirdPartyManager {
    if (!ThirdPartyManager.instance) {
      ThirdPartyManager.instance = new ThirdPartyManager();
return ThirdPartyManager.instance;
public getConfig(): ThirdPartyConfig {
    return this.config;
public setConfig(config: Partial<ThirdPartyConfig>): void {
    this.config = {
      ...this.config,
      ...config
public setAuthConfig(authConfig: Partial<AuthConfig>): void {
    this.config.auth = {
      ...this.config.auth,
      ...authConfig
public getAuthConfig(): AuthConfig {
    return this.config.auth;
