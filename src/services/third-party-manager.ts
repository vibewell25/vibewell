import { THIRD_PARTY_CONFIG } from '../config/third-party';
import type { ThirdPartyConfig, ServiceConfig } from '../types/third-party';

export class ThirdPartyManager {
  private static instance: ThirdPartyManager;
  private config: ThirdPartyConfig;
  private serviceInstances: Map<string, any>;

  private constructor() {
    this.config = THIRD_PARTY_CONFIG;
    this.serviceInstances = new Map();
    this.initializeServices();
  }

  public static getInstance(): ThirdPartyManager {
    if (!ThirdPartyManager.instance) {
      ThirdPartyManager.instance = new ThirdPartyManager();
    }
    return ThirdPartyManager.instance;
  }

  private async initializeServices(): Promise<void> {
    if (this.config.analytics?.enabled) {
      await this.initializeAnalytics();
    }
    if (this.config.payment?.enabled) {
      await this.initializePayment();
    }
    if (this.config.auth?.enabled) {
      await this.initializeAuth();
    }
    if (this.config.storage?.enabled) {
      await this.initializeStorage();
    }
    if (this.config.messaging?.enabled) {
      await this.initializeMessaging();
    }
    if (this.config.search?.enabled) {
      await this.initializeSearch();
    }
    if (this.config.logging?.enabled) {
      await this.initializeLogging();
    }
    if (this.config.ai?.enabled) {
      await this.initializeAI();
    }
  }

  private async initializeAnalytics(): Promise<void> {
    const config = this.config.analytics!;
    switch (config.service) {
      case 'google-analytics':
        const ga = await import('ga');
        this.serviceInstances.set('analytics', new ga.Analytics(config));
        break;
      case 'mixpanel':
        const mixpanel = await import('mixpanel');
        this.serviceInstances.set('analytics', mixpanel.init(config.credentials.apiKey));
        break;
      case 'segment':
        const segment = await import('@segment/analytics-node');
        this.serviceInstances.set('analytics', new segment.Analytics(config.credentials));
        break;
    }
  }

  private async initializePayment(): Promise<void> {
    const config = this.config.payment!;
    switch (config.service) {
      case 'stripe':
        const stripe = await import('stripe');
        this.serviceInstances.set('payment', new stripe.default(config.credentials.apiKey!));
        break;
      case 'paypal':
        const paypal = await import('@paypal/checkout-server-sdk');
        this.serviceInstances.set('payment', this.createPayPalClient(config));
        break;
      case 'square':
        const square = await import('square');
        this.serviceInstances.set('payment', new square.Client(config.credentials));
        break;
    }
  }

  private async initializeAuth(): Promise<void> {
    const config = this.config.auth!;
    switch (config.service) {
      case 'auth0':
        const auth0 = await import('auth0');
        this.serviceInstances.set('auth', new auth0.AuthenticationClient(config.credentials));
        break;
      case 'firebase':
        const firebase = await import('firebase/auth');
        this.serviceInstances.set('auth', firebase.getAuth());
        break;
      case 'okta':
        const okta = await import('@okta/okta-auth-js');
        this.serviceInstances.set('auth', new okta.OktaAuth(config.credentials));
        break;
    }
  }

  private async initializeStorage(): Promise<void> {
    const config = this.config.storage!;
    switch (config.service) {
      case 's3':
        const aws = await import('aws-sdk');
        this.serviceInstances.set('storage', new aws.S3(config.credentials));
        break;
      case 'gcs':
        const { Storage } = await import('@google-cloud/storage');
        this.serviceInstances.set('storage', new Storage(config.credentials));
        break;
      case 'azure-blob':
        const { BlobServiceClient } = await import('@azure/storage-blob');
        this.serviceInstances.set('storage', BlobServiceClient.fromConnectionString(config.credentials.apiKey!));
        break;
    }
  }

  private async initializeMessaging(): Promise<void> {
    const config = this.config.messaging!;
    switch (config.service) {
      case 'sendgrid':
        const sendgrid = await import('@sendgrid/mail');
        sendgrid.setApiKey(config.credentials.apiKey!);
        this.serviceInstances.set('messaging', sendgrid);
        break;
      case 'twilio':
        const twilio = await import('twilio');
        this.serviceInstances.set('messaging', twilio(config.credentials.apiKey!, config.credentials.apiSecret!));
        break;
      case 'firebase-fcm':
        const admin = await import('firebase-admin');
        this.serviceInstances.set('messaging', admin.messaging());
        break;
    }
  }

  private async initializeSearch(): Promise<void> {
    const config = this.config.search!;
    switch (config.service) {
      case 'algolia':
        const algoliasearch = await import('algoliasearch');
        this.serviceInstances.set('search', algoliasearch(config.credentials.clientId!, config.credentials.apiKey!));
        break;
      case 'elasticsearch':
        const { Client } = await import('@elastic/elasticsearch');
        this.serviceInstances.set('search', new Client(config.credentials));
        break;
      case 'meilisearch':
        const meilisearch = await import('meilisearch');
        this.serviceInstances.set('search', new meilisearch.MeiliSearch(config.credentials));
        break;
    }
  }

  private async initializeLogging(): Promise<void> {
    const config = this.config.logging!;
    switch (config.service) {
      case 'sentry':
        const Sentry = await import('@sentry/node');
        Sentry.init({
          dsn: config.credentials.apiKey,
          environment: config.environment,
          debug: config.logLevel === 'debug'
        });
        this.serviceInstances.set('logging', Sentry);
        break;
      case 'datadog':
        const dd = await import('dd-trace');
        dd.init(config.credentials);
        this.serviceInstances.set('logging', dd);
        break;
      case 'newrelic':
        const newrelic = await import('newrelic');
        this.serviceInstances.set('logging', newrelic);
        break;
    }
  }

  private async initializeAI(): Promise<void> {
    const config = this.config.ai!;
    switch (config.service) {
      case 'openai':
        const { Configuration, OpenAIApi } = await import('openai');
        const configuration = new Configuration(config.credentials);
        this.serviceInstances.set('ai', new OpenAIApi(configuration));
        break;
      case 'cohere':
        const cohere = await import('cohere-ai');
        cohere.init(config.credentials.apiKey!);
        this.serviceInstances.set('ai', cohere);
        break;
      case 'anthropic':
        const Anthropic = await import('@anthropic-ai/sdk');
        this.serviceInstances.set('ai', new Anthropic(config.credentials.apiKey!));
        break;
    }
  }

  private createPayPalClient(config: ServiceConfig): any {
    const paypal = require('@paypal/checkout-server-sdk');
    const environment = config.testMode
      ? new paypal.core.SandboxEnvironment(config.credentials.clientId, config.credentials.clientSecret)
      : new paypal.core.LiveEnvironment(config.credentials.clientId, config.credentials.clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
  }

  public getService(serviceName: keyof ThirdPartyConfig): any {
    return this.serviceInstances.get(serviceName);
  }

  public isServiceEnabled(serviceName: keyof ThirdPartyConfig): boolean {
    const config = this.config[serviceName];
    return config?.enabled || false;
  }

  public getServiceConfig(serviceName: keyof ThirdPartyConfig): ServiceConfig | undefined {
    return this.config[serviceName];
  }
} 