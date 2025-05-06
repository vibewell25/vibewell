const CACHE_NAME = 'vibewell-cache-v1';
const OFFLINE_URL = '/offline';
const ASSETS_CACHE_NAME = 'vibewell-assets-cache';
const PAGES_CACHE_NAME = 'vibewell-pages-cache';
const DATA_CACHE_NAME = 'vibewell-data-cache';

// Assets to cache immediately during installation
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
];

// Limit for the number of pages to cache
const MAX_CACHED_PAGES = 25;

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(ASSETS_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Precaching core app shell');
        return cache.addAll(PRECACHE_ASSETS);
),
      
      // Create other caches
      caches.open(PAGES_CACHE_NAME),
      caches.open(DATA_CACHE_NAME)
    ])
    .then(() => {
      console.log('[Service Worker] Skip waiting on install');
      return self.skipWaiting();
)
// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  const currentCaches = [ASSETS_CACHE_NAME, PAGES_CACHE_NAME, DATA_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
)
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('[Service Worker] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
)
)
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
)
// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
// Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
const requestURL = new URL(event.request.url);
  
  // API requests - network first, then cache
  if (requestURL.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithBackgroundSync(event));
    return;
// HTML pages - network first, then cache, then offline page
  if (requestURL.pathname.endsWith('/') || 
      requestURL.pathname.endsWith('.html') || 
      (requestURL.pathname.match(/^\/[^\.]+$/) && !requestURL.pathname.includes('.'))) {
    event.respondWith(networkFirstForPages(event));
    return;
// Assets - cache first, then network
  event.respondWith(cacheFirstForAssets(event));
// Strategy for HTML pages
async function networkFirstForPages(event) {
  const cacheName = PAGES_CACHE_NAME;
  
  try {
    // Try network first
    const networkResponse = await fetch(event.request);
    
    // Cache the page if it's a successful response
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      
      // Before adding a new page, check if we need to remove old ones
      const keys = await cache.keys();
      if (keys.length >= MAX_CACHED_PAGES) {
        // Remove the oldest cached page
        await cache.delete(keys[0]);
// Add the new page to the cache
      await cache.put(event.request, networkResponse.clone());
return networkResponse;
catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(event.request);
    
    if (cachedResponse) {
      return cachedResponse;
// If not in cache, return the offline page
    return caches.match(OFFLINE_URL);
// Strategy for static assets
async function cacheFirstForAssets(event) {
  const cachedResponse = await caches.match(event.request);
  
  if (cachedResponse) {
    return cachedResponse;
try {
    // If not in cache, try network
    const networkResponse = await fetch(event.request);
    
    // Cache the asset for future requests
    if (networkResponse.status === 200) {
      const cache = await caches.open(ASSETS_CACHE_NAME);
      await cache.put(event.request, networkResponse.clone());
return networkResponse;
catch (error) {
    // If both cache and network fail, return a fallback if available
    const url = new URL(event.request.url);
    
    if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')) {
      return caches.match('/icons/icon-192x192.png');
// For other assets, just propagate the error
    throw error;
// Strategy for API requests with background sync
async function networkFirstWithBackgroundSync(event) {
  try {
    // Try network first
    const response = await fetch(event.request);
    
    // Cache successful responses
    if (response.status === 200) {
      const clonedResponse = response.clone();
      caches.open(DATA_CACHE_NAME).then((cache) => {
        cache.put(event.request, clonedResponse);
return response;
catch (error) {
    // If offline, get from cache
    const cachedResponse = await caches.match(event.request);
    
    if (cachedResponse) {
      // Also register for background sync if this was a POST/PUT/DELETE
      if (event.request.method !== 'GET') {
        // Add to a background sync queue
        await addToSyncQueue(event.request.clone());
        
        // Register a sync if supported
        if ('SyncManager' in self) {
          try {
            await self.registration.sync.register('sync-api-requests');
            console.log('[Service Worker] Background sync registered!');
catch (err) {
            console.log('[Service Worker] Background sync registration failed:', err);
return cachedResponse;
throw error;
// Background sync for API requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-api-requests') {
    event.waitUntil(syncData());
// Queue for background sync
const syncDataQueue = new Map();

// Add request to sync queue
async function addToSyncQueue(request) {
  const body = await request.text();
  
  syncDataQueue.set(request.url, {
    method: request.method,
    headers: Array.from(request.headers.entries()),
    body,
    timestamp: Date.now()
// Store in IndexedDB for persistence
  if ('indexedDB' in self) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction('sync-requests', 'readwrite');
      const store = transaction.objectStore('sync-requests');
      
      await store.put({
        id: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        body,
        timestamp: Date.now()
catch (err) {
      console.error('[Service Worker] Failed to store sync request:', err);
// Process background sync queue
async function syncData() {
  let successCount = 0;
  let failCount = 0;
  
  // Process in-memory queue
  const entries = Array.from(syncDataQueue.entries());
  
  for (const [url, data] of entries) {
    try {
      await fetch(url, {
        method: data.method,
        headers: new Headers(data.headers),
        body: data.body
syncDataQueue.delete(url);
      successCount++;
      
      // Also remove from IndexedDB
      if ('indexedDB' in self) {
        try {
          const db = await openDatabase();
          const transaction = db.transaction('sync-requests', 'readwrite');
          const store = transaction.objectStore('sync-requests');
          await store.delete(url);
catch (err) {
          console.error('[Service Worker] Failed to remove synced request:', err);
catch (error) {
      console.error('[Service Worker] Sync failed for', url, error);
      failCount++;
// Also check IndexedDB for any missed items
  if ('indexedDB' in self) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction('sync-requests', 'readonly');
      const store = transaction.objectStore('sync-requests');
      const requests = await getAllFromStore(store);
      
      for (const request of requests) {
        if (!syncDataQueue.has(request.id)) {
          try {
            await fetch(request.id, {
              method: request.method,
              headers: new Headers(request.headers),
              body: request.body
// Remove from IndexedDB
            const deleteTransaction = db.transaction('sync-requests', 'readwrite');
            const deleteStore = deleteTransaction.objectStore('sync-requests');
            await deleteStore.delete(request.id);
            
            successCount++;
catch (error) {
            failCount++;
catch (err) {
      console.error('[Service Worker] Failed to process IndexedDB sync requests:', err);
console.log(`[Service Worker] Sync completed. Success: ${successCount}, Failed: ${failCount}`);
  
  // If any failed, register for another sync
  if (failCount > 0 && 'SyncManager' in self) {
    await self.registration.sync.register('sync-api-requests');
// Open or create IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vibewell-sync-db', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('sync-requests', { keyPath: 'id' });
request.onsuccess = (event) => {
      resolve(event.target.result);
request.onerror = (event) => {
      reject(event.target.error);
// Get all items from an IndexedDB store
function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
request.onerror = (event) => {
      reject(event.target.error);
// Listen for push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[Service Worker] Push received but no data');
    return;
const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification from VibeWell',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
event.waitUntil(self.registration.showNotification(data.title || 'VibeWell', options));
// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
// Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
)
