import { WebSocketServer, WebSocket } from 'ws';

import { logger } from '@/lib/logger';
import { createCipheriv, createDecipheriv } from 'crypto';
import { z } from 'zod';
import { ZodError } from 'zod';

import NodeCache from 'node-cache';

interface MetricsData {
  timestamp: string;
  metrics: {
    views: number;
    interactions: number;
    conversions: number;
    errors: number;
    conversionRate: number;
interface ViewAggregate {
  timestamp: Date;
  _count: {
    id: number;
// Data validation schemas
const AnalyticsEventSchema = z.object({
  type: z.enum(['view', 'interaction', 'conversion', 'error']),
  timestamp: z.date(),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.any()),
type ValidatedAnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

interface AnalyticsEvent {
  type: 'view' | 'interaction' | 'conversion' | 'error';
  timestamp: Date;
  sessionId: string;
  userId?: string;
  metadata: Record<string, any>;
class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;
  private eventBuffer: AnalyticsEvent[];
  private rateLimiter: Map<string, { count: number; timestamp: number }>;
  private metricsCache: NodeCache;
  private inMemoryStore: {
    views: AnalyticsEvent[];
    interactions: AnalyticsEvent[];
    conversions: AnalyticsEvent[];
    errors: AnalyticsEvent[];
private readonly FLUSH_INTERVAL = 5000;
  private readonly BROADCAST_INTERVAL = 1000;
  private readonly RATE_LIMIT = 100;
  private readonly ENCRYPTION_KEY =


    process.env.ANALYTICS_ENCRYPTION_KEY || 'default-key-32-chars-12345678901';
  private readonly ENCRYPTION_IV = Buffer.from(process.env.ANALYTICS_IV || '1234567890123456');
  private readonly RETENTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Set();
    this.eventBuffer = [];
    this.rateLimiter = new Map();
    this.metricsCache = new NodeCache({ stdTTL: 60 }); // Cache for 1 minute
    this.inMemoryStore = {
      views: [],
      interactions: [],
      conversions: [],
      errors: [],
this.setupWebSocketServer();
    this.startFlushInterval();
    this.startBroadcastInterval();
    this.startRateLimiterCleanup();
    this.startDataCleanup();

    logger.info(`Analytics WebSocket server started on port ${port}`);
private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      logger.info('New client connected to analytics websocket');

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('Client disconnected from analytics websocket');
ws.on('error', (error: Error) => {
        logger.error('WebSocket error:', error.message);
private startFlushInterval() {
    setInterval(() => {
      this.flushBuffer().catch((error) => {
        logger.error(
          'Error flushing buffer:',
          error instanceof Error ? error.message : String(error),
this.FLUSH_INTERVAL);
private startBroadcastInterval() {
    setInterval(() => {
      this.broadcastMetrics().catch((error) => {
        logger.error(
          'Error broadcasting metrics:',
          error instanceof Error ? error.message : String(error),
this.BROADCAST_INTERVAL);
private startDataCleanup() {
    setInterval(() => {
      const cutoff = new Date(Date.now() - this.RETENTION_PERIOD);

      this.inMemoryStore.views = this.inMemoryStore.views.filter(
        (event) => event.timestamp > cutoff,
this.inMemoryStore.interactions = this.inMemoryStore.interactions.filter(
        (event) => event.timestamp > cutoff,
this.inMemoryStore.conversions = this.inMemoryStore.conversions.filter(
        (event) => event.timestamp > cutoff,
this.inMemoryStore.errors = this.inMemoryStore.errors.filter(
        (event) => event.timestamp > cutoff,
logger.info('Cleaned up old analytics data');
this.RETENTION_PERIOD);
private validateEvent(event: unknown): AnalyticsEvent {
    try {
      const validatedEvent = AnalyticsEventSchema.parse(event);
      return validatedEvent as AnalyticsEvent;
catch (error) {
      if (error instanceof ZodError) {
        logger.error('Invalid analytics event:', error.message);
else {
        logger.error(
          'Invalid analytics event:',
          error instanceof Error ? error.message : String(error),
throw new Error('Invalid analytics event');
private encryptSensitiveData(data: string): string {

    const cipher = createCipheriv('aes-256-cbc', this.ENCRYPTION_KEY, this.ENCRYPTION_IV);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    if (encrypted > Number.MAX_SAFE_INTEGER || encrypted < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); encrypted += cipher.final('hex');
    return encrypted;
private decryptSensitiveData(encrypted: string): string {

    const decipher = createDecipheriv('aes-256-cbc', this.ENCRYPTION_KEY, this.ENCRYPTION_IV);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    if (decrypted > Number.MAX_SAFE_INTEGER || decrypted < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); decrypted += decipher.final('utf8');
    return decrypted;
private async flushBuffer() {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    events.forEach((event) => {
      switch (event.type) {
        case 'view':
          this.inMemoryStore.views.push(event);
          break;
        case 'interaction':
          this.inMemoryStore.interactions.push(event);
          break;
        case 'conversion':
          this.inMemoryStore.conversions.push(event);
          break;
        case 'error':
          this.inMemoryStore.errors.push(event);
          break;
private async getMetricsFromCache(): Promise<MetricsData> {

    const cachedMetrics = this.metricsCache.get<MetricsData>('realtime-metrics');
    if (cachedMetrics) {
      return cachedMetrics;
const metrics = await this.calculateMetrics();

    this.metricsCache.set('realtime-metrics', metrics);
    return metrics;
private async calculateMetrics(): Promise<MetricsData> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const views = this.inMemoryStore.views.filter(
      (event) => event.timestamp >= fiveMinutesAgo,
    ).length;
    const interactions = this.inMemoryStore.interactions.filter(
      (event) => event.timestamp >= fiveMinutesAgo,
    ).length;
    const conversions = this.inMemoryStore.conversions.filter(
      (event) => event.timestamp >= fiveMinutesAgo,
    ).length;
    const errors = this.inMemoryStore.errors.filter(
      (event) => event.timestamp >= fiveMinutesAgo,
    ).length;

    return {
      timestamp: now.toISOString(),
      metrics: {
        views,
        interactions,
        conversions,
        errors,

        conversionRate: views > 0 ? (conversions / views) * 100 : 0,
private async broadcastMetrics() {
    if (this.clients.size === 0) return;

    try {
      const metrics = await this.getMetricsFromCache();
      const message = JSON.stringify(metrics);

      Array.from(this.clients).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
catch (error) {
      logger.error(
        'Error broadcasting metrics:',
        error instanceof Error ? error.message : String(error),
public trackEvent(event: AnalyticsEvent) {
    try {
      const validatedEvent = this.validateEvent(event);

      if (this.isRateLimited(validatedEvent.sessionId)) {
        logger.warn(`Rate limit exceeded for session ${validatedEvent.sessionId}`);
        return;
if (validatedEvent.userId) {
        validatedEvent.userId = this.encryptSensitiveData(validatedEvent.userId);
this.eventBuffer.push(validatedEvent);
catch (error) {
      logger.error('Error tracking event:', error instanceof Error ? error.message : String(error));
private isRateLimited(sessionId: string): boolean {
    const now = Date.now();

    const minute = Math.floor(now / 60000);
    const entry = this.rateLimiter.get(sessionId);

    if (!entry || entry.timestamp < minute) {
      this.rateLimiter.set(sessionId, { count: 1, timestamp: minute });
      return false;
if (entry.count >= this.RATE_LIMIT) {
      return true;
entry.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
    return false;
private startRateLimiterCleanup() {
    setInterval(() => {
      const now = Math.floor(Date.now() / 60000);
      Array.from(this.rateLimiter.entries()).forEach(([sessionId, entry]) => {

        if (entry.timestamp < now - 5) {
          this.rateLimiter.delete(sessionId);
60000);
// Export a singleton instance
export {};
