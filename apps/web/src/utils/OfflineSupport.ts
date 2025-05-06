import { performanceMonitor } from './performance-monitor';

interface OfflineConfig {
  cacheName: string;
  version: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
interface SyncTask {
  id: string;
  url: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retries?: number;
export class OfflineManager {
  private config: OfflineConfig;
  private syncQueue: SyncTask[] = [];
  private isOnline: boolean = navigator.onLine;
  private sw: ServiceWorkerRegistration | null = null;

  constructor(config: OfflineConfig) {
    this.config = config;
    this.initializeEventListeners();
private initializeEventListeners(): void {
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
private handleOnlineStatus(online: boolean): void {
    this.isOnline = online;
    if (online) {
      this.processSyncQueue().catch(console.error);
async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {

        const registration = await navigator.serviceWorker.register('/service-worker.js');
        this.sw = registration;
        performanceMonitor.track({
          serviceWorkerRegistration: performance.now(),
catch (error) {
      console.error('Service worker registration failed:', error);
      performanceMonitor.track({
        serviceWorkerError: performance.now(),
async initializeSyncSupport(): Promise<void> {
    try {
      // Load persisted sync queue
      const storedQueue = localStorage.getItem('syncQueue');
      if (storedQueue) {
        const parsedQueue = JSON.parse(storedQueue) as SyncTask[];
        this.syncQueue = parsedQueue;
performanceMonitor.track({
        offlineReady: performance.now(),
catch (error) {
      console.error('Failed to initialize sync support:', error);
private async cacheResponse(request: Request, response: Response): Promise<void> {
    const cache = await caches.open(this.config.cacheName);
    await cache.put(request, response.clone());
private async cleanupCache(): Promise<void> {
    const cache = await caches.open(this.config.cacheName);
    const keys = await cache.keys();
    const now = Date.now();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = new Date(response.headers.get('date') || '').getTime();

        if (now - cacheTime > (this.config.maxAgeSeconds || 86400) * 1000) {
          await cache.delete(request);
async fetchWithStrategy(
    input: RequestInfo,
    init?: RequestInit,




    strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' = 'cache-first',
  ): Promise<Response> {
    const request = new Request(input, init);
    const startTime = performance.now();

    try {
      let response: Response;

      switch (strategy) {

        case 'cache-first':
          response = await this.cacheFirstStrategy(request);
          break;

        case 'network-first':
          response = await this.networkFirstStrategy(request);
          break;

        case 'stale-while-revalidate':
          response = await this.staleWhileRevalidateStrategy(request);
          break;
        default:
          response = await this.cacheFirstStrategy(request);
performanceMonitor.track({
        fetchStrategyTime: performance.now() - startTime,
return response;
catch (error) {
      performanceMonitor.track({
        fetchError: performance.now() - startTime,
throw error;
private async cacheFirstStrategy(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
const response = await fetch(request);
    await this.cacheResponse(request, response);
    return response;
private async networkFirstStrategy(request: Request): Promise<Response> {
    try {
      const response = await fetch(request);
      await this.cacheResponse(request, response);
      return response;
catch (error) {
      const cache = await caches.open(this.config.cacheName);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
throw error;
private async staleWhileRevalidateStrategy(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
      .then((response) => {
        this.cacheResponse(request, response.clone());
        return response;
)
      .catch((error) => {
        console.error('Network request failed:', error);
        return null;
return cached || (await networkPromise) || new Response('Not available', { status: 504 });
async addToSyncQueue(task: Omit<SyncTask, 'id' | 'timestamp'>): Promise<void> {
    const syncTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
this.syncQueue.push(syncTask);
    await this.persistSyncQueue();

    if (this.isOnline) {
      this.processSyncQueue().catch(console.error);
private async persistSyncQueue(): Promise<void> {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
private async processSyncQueue(): Promise<void> {
    const MAX_RETRIES = 3;

    while (this.syncQueue.length > 0 && this.isOnline) {
      const task = this.syncQueue[0];

      try {
        const response = await fetch(task.url, {
          method: task.method,
          body: task.body ? JSON.stringify(task.body) : undefined,
          headers: task.headers,
if (response.ok) {
          this.syncQueue.shift();
          await this.persistSyncQueue();
          performanceMonitor.track({
            syncSuccess: performance.now(),
else if ((task.retries || 0) < MAX_RETRIES) {
          task.retries = (task.retries || 0) + 1;
          await this.persistSyncQueue();
else {
          this.syncQueue.shift();
          await this.persistSyncQueue();
          performanceMonitor.track({
            syncError: performance.now(),
catch (error) {
        console.error('Sync task failed:', error);
        if ((task.retries || 0) < MAX_RETRIES) {
          task.retries = (task.retries || 0) + 1;
          await this.persistSyncQueue();
else {
          this.syncQueue.shift();
          await this.persistSyncQueue();
          performanceMonitor.track({
            syncError: performance.now(),
