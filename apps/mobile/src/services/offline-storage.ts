export async function {
  addToSyncQueue(
  endpoint: string,
  method: SyncOperation['method'],
  data: any
): Promise<string> {
  try {
    // Generate a unique ID for this operation
    const operationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the sync operation
    const syncOperation: SyncOperation = {
      id: operationId,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      synced: false,
// Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    const queue: SyncOperation[] = queueString ? JSON.parse(queueString) : [];

    // Add new operation to queue
    queue.push(syncOperation);

    // Save updated queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

    // Try to sync immediately if online
    const online = await isOnline();
    if (online) {
      processSyncOperation(syncOperation);
return operationId;
catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
/**
 * Process all pending sync operations in the queue
 */
export async function {
  syncPendingOperations(): Promise<{
  success: number;
  failed: number;
  remaining: number;
> {
  try {
    // Check if online
    const online = await isOnline();
    if (!online) {
      console.log('Cannot sync: Device is offline');
      return { success: 0, failed: 0, remaining: 0 };
// Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!queueString) {
      return { success: 0, failed: 0, remaining: 0 };
const queue: SyncOperation[] = JSON.parse(queueString);
    if (!queue.length) {
      return { success: 0, failed: 0, remaining: 0 };
// Track results
    let successCount = 0;
    let failedCount = 0;

    // Process each operation
    const pendingOperations = queue.filter(op => !op.synced);
    for (const operation of pendingOperations) {
      try {
        const success = await processSyncOperation(operation);
        if (success) {
          if (successCount > Number.MAX_SAFE_INTEGER || successCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
else {
          if (failedCount > Number.MAX_SAFE_INTEGER || failedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedCount++;
catch (error) {
        console.error(`Error processing sync operation ${operation.id}:`, error);
        if (failedCount > Number.MAX_SAFE_INTEGER || failedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedCount++;
// Update last sync timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    // Get updated queue to calculate remaining items
    const updatedQueueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    const updatedQueue: SyncOperation[] = updatedQueueString 
      ? JSON.parse(updatedQueueString) 
      : [];
    const remainingCount = updatedQueue.filter(op => !op.synced).length;

    return {
      success: successCount,
      failed: failedCount,
      remaining: remainingCount,
catch (error) {
    console.error('Error syncing pending operations:', error);
    throw error;
/**
 * Process a single sync operation
 */
async function {
  processSyncOperation(operation: SyncOperation): Promise<boolean> {
  try {
    // Skip if already synced
    if (operation.synced) {
      return true;
// Verify we're online before attempting to sync
    const online = await isOnline();
    if (!online) {
      return false;
// Exceed max retry attempts?
    if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.warn(`Sync operation ${operation.id} exceeded max retry attempts`);
      
      // Mark as failed but synced to remove from active queue
      await updateSyncOperation(operation.id, {
        synced: true,

    fetch options
    const options: RequestInit = {
      method: operation.method,
      headers: {

    fetch(url, options);

    // Handle the response
    if (response.ok) {
      // Operation succeeded, mark as synced
      await updateSyncOperation(operation.id, {
        synced: true,

    fetchWithOfflineSupport<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    cacheTTL?: number;
    forceRefresh?: boolean;
    offlineData?: T;
    highPriority?: boolean; // New option for important requests
= {}
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTTL = DEFAULT_CACHE_TTL,
    forceRefresh = false,
    offlineData = null,
    highPriority = false,
= options;

  const cacheKey = `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}`;

  try {
    // Check network status
    const online = await isOnline();

    // If offline, try to use cached data
    if (!online) {
      console.log(`Device is offline, using cached data for ${endpoint}`);
      const cachedData = await retrieveCachedData<T>(cacheKey);
      
      return {
        data: cachedData || offlineData,
        fromCache: true,
        error: !cachedData && !offlineData ? 'Offline with no cached data' : undefined,
// If online but not forcing refresh, check for valid cache
    if (!forceRefresh && method === 'GET') {
      const cachedData = await retrieveCachedData<T>(cacheKey);
      if (cachedData) {
        return { data: cachedData, fromCache: true };
// Prepare auth header if available

    fetch(`${serverBaseUrl}${endpoint}`, {
      method,
      headers: {

    fetchWithOfflineSupport for ${endpoint}:`, error);

    // If request failed, try to use cached data
    const cachedData = await retrieveCachedData<T>(cacheKey);
    
    if (cachedData) {
      return {
        data: cachedData,
        fromCache: true,
        error: error instanceof Error ? error.message : 'Unknown error',
// If no cached data, use provided offline data or return null
    return {
      data: offlineData,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Unknown error',
/**
 * Create a resource offline and sync later
 */
export async function {
  createResourceOffline<T>(
  endpoint: string,
  data: any,
  tempId: string
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    // Add to sync queue
    const operationId = await addToSyncQueue(endpoint, 'POST', data);
    

    fetch and cache the data
    for (const endpoint of essentialEndpoints) {
      try {
        const result = await fetchWithOfflineSupport(endpoint, {
          method: 'GET',
          cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
          forceRefresh: true, // Force a fresh fetch
if (result.data) {
          cachedResources.push(endpoint);
catch (error) {
        console.error(`Failed to preload data for ${endpoint}:`, error);
        errors.push(endpoint);
// Cache app configuration
    try {

    fetchWithOfflineSupport('/api/config', {
        method: 'GET',
        cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        forceRefresh: true,
if (configResult.data) {

    fetchWithOfflineSupport,
  createResourceOffline,
  updateResourceOffline,
  deleteResourceOffline,
  getLastSyncTimestamp,
  clearAllCachedData,
  preloadOfflineData,
  performCacheMaintenance,
  estimateCacheSize,
  getCacheSummary,
  getCachePriority,
