import { BookingStatus } from '@prisma/client';

interface CachedData {
  appointments: CachedAppointment[];
  services: CachedService[];
  lastSynced: string;
interface CachedAppointment {
  id?: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  notes?: string;
  customerId: string;
  needsSync: boolean;
interface CachedService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
  category?: string;
  needsSync: boolean;
class OfflineSyncService {
  private dbName = 'vibewell';
  private dbVersion = 1;
  private cachedDataStore = 'cachedData';

  async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.cachedDataStore)) {
          db.createObjectStore(this.cachedDataStore, { keyPath: 'id' });
async getCachedData(): Promise<CachedData | null> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.cachedDataStore, 'readonly');
      const store = transaction.objectStore(this.cachedDataStore);
      const data = await new Promise<CachedData[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
return data[0] || null;
catch (error) {
      console.error('Error getting cached data:', error);
      return null;
async setCachedData(data: CachedData): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.cachedDataStore, 'readwrite');
      const store = transaction.objectStore(this.cachedDataStore);
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: 1, ...data });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
catch (error) {
      console.error('Error setting cached data:', error);
async syncAppointment(appointment: CachedAppointment): Promise<boolean> {
    try {

      const response = await fetch('/api/appointments/sync', {
        method: 'POST',
        headers: {


          'Content-Type': 'application/json',
body: JSON.stringify(appointment),
if (!response.ok) {
        throw new Error('Failed to sync appointment');
return true;
catch (error) {
      console.error('Error syncing appointment:', error);
      return false;
async syncService(service: CachedService): Promise<boolean> {
    try {

      const response = await fetch('/api/services/sync', {
        method: 'POST',
        headers: {


          'Content-Type': 'application/json',
body: JSON.stringify(service),
if (!response.ok) {
        throw new Error('Failed to sync service');
return true;
catch (error) {
      console.error('Error syncing service:', error);
      return false;
async syncAll(): Promise<boolean> {
    try {
      const cachedData = await this.getCachedData();
      if (!cachedData) return false;

      // Sync appointments
      const appointmentResults = await Promise.all(
        cachedData.appointments
          .filter((appointment) => appointment.needsSync)
          .map((appointment) => this.syncAppointment(appointment)),
// Sync services
      const serviceResults = await Promise.all(
        cachedData.services
          .filter((service) => service.needsSync)
          .map((service) => this.syncService(service)),
// Update last synced timestamp
      await this.setCachedData({
        ...cachedData,
        lastSynced: new Date().toISOString(),
        appointments: cachedData.appointments.map((appointment) => ({
          ...appointment,
          needsSync: appointmentResults.some((result) => !result) && appointment.needsSync,
)),
        services: cachedData.services.map((service) => ({
          ...service,
          needsSync: serviceResults.some((result) => !result) && service.needsSync,
)),
return true;
catch (error) {
      console.error('Error syncing all data:', error);
      return false;
async addAppointment(appointment: Omit<CachedAppointment, 'needsSync'>): Promise<void> {
    try {
      const cachedData = await this.getCachedData();
      if (!cachedData) {
        await this.setCachedData({
          appointments: [{ ...appointment, needsSync: true }],
          services: [],
          lastSynced: new Date().toISOString(),
return;
await this.setCachedData({
        ...cachedData,
        appointments: [...cachedData.appointments, { ...appointment, needsSync: true }],
catch (error) {
      console.error('Error adding appointment to cache:', error);
async addService(service: Omit<CachedService, 'needsSync'>): Promise<void> {
    try {
      const cachedData = await this.getCachedData();
      if (!cachedData) {
        await this.setCachedData({
          appointments: [],
          services: [{ ...service, needsSync: true }],
          lastSynced: new Date().toISOString(),
return;
await this.setCachedData({
        ...cachedData,
        services: [...cachedData.services, { ...service, needsSync: true }],
catch (error) {
      console.error('Error adding service to cache:', error);
export {};
