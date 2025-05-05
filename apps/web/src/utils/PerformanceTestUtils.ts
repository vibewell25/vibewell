import { performance, Performance } from 'perf_hooks';

type ValidEntryType = 'paint' | 'longtask' | 'measure' | 'mark' | 'resource' | 'navigation';
type CombinedEntryType = ValidEntryType | string; // Allow string for extensibility while keeping type safety

declare global {
  interface PerformanceObserverInit {
    entryTypes?: string[];
interface PerformanceObserver {
    observe(options: PerformanceObserverInit): void;
    disconnect(): void;
    takeRecords(): PerformanceEntryList;
interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
interface PerformanceObserverConstructor {
  readonly prototype: PerformanceObserver;
  new (
    callback: (entries: PerformanceEntryList, observer: PerformanceObserver) => void,
  ): PerformanceObserver;
  readonly supportedEntryTypes: readonly string[];
declare const PerformanceObserver: PerformanceObserverConstructor;

interface PerformanceMetrics {
  executionTime: number;
  fps?: number;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
networkMetrics?: {
    domainLookupTime: number;
    connectTime: number;
    ttfb: number;
    downloadTime: number;
// Type guard for memory metrics
function hasMemoryMetrics(perf: Performance): perf is Performance & {
  memory: { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number };
{
  return typeof (perf as any).memory !== 'undefined';
export interface MemoryMetrics {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
export interface NetworkMetrics {
  domainLookupTime: number;
  connectTime: number;
  ttfb: number;
  downloadTime: number;
export interface PerformanceResult {
  executionTime: number;
  memoryUsage: MemoryMetrics | undefined;
/**
 * Creates a performance observer for monitoring specific performance entry types.
 * @param entryTypes Array of entry types to observe
 * @param callback Function to handle performance entries
 * @returns PerformanceObserver instance
 */
export function createPerformanceObserver(
  entryTypes: CombinedEntryType[],
  callback: (entries: PerformanceEntryList) => void,
): PerformanceObserver {
  const observer = new PerformanceObserver((entries) => callback(entries));
  observer.observe({ entryTypes });
  return observer;
/**
 * Measures memory usage of the application
 * @returns Memory usage metrics
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); measureMemoryUsage(): Promise<MemoryMetrics | undefined> {
  if (hasMemoryMetrics(performance)) {
    const memory = performance.memory;
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
return undefined;
/**
 * Enhanced performance measurement with memory and network metrics
 * @param fn Function to measure
 * @returns Promise resolving to comprehensive performance metrics
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); measurePerformance(fn: () => any): Promise<PerformanceResult> {
  const start = performance.now();
  await fn();
  const end = performance.now();

  return {

    executionTime: end - start,
    memoryUsage: await measureMemoryUsage(),
/**
 * Measures paint timing metrics.
 * @param callback Function to handle paint entries
 * @returns PerformanceObserver instance
 */
export function measurePaintTiming(
  callback: (entries: PerformanceEntryList) => void,
): PerformanceObserver {
  return createPerformanceObserver(['paint'], callback);
/**
 * Measures long tasks.
 * @param callback Function to handle long task entries
 * @returns PerformanceObserver instance
 */
export function measureLongTasks(
  callback: (entries: PerformanceEntryList) => void,
): PerformanceObserver {
  return createPerformanceObserver(['longtask'], callback);
/**
 * Measures frames per second (FPS).
 * @param duration Duration in milliseconds to measure FPS
 * @returns Promise resolving to FPS measurement
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); measureFPS(duration: number): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    const startTime = performance.now();

    function countFrame() {
      if (frameCount > Number.MAX_SAFE_INTEGER || frameCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); frameCount++;
      const currentTime = performance.now();


      if (currentTime - startTime < duration) {
        requestAnimationFrame(countFrame);
else {

        resolve(Math.round((frameCount * 1000) / duration));
requestAnimationFrame(countFrame);
export {};

/**
 * Measures detailed network timing for a request
 * @param timing PerformanceResourceTiming object
 * @returns Detailed network metrics
 */
function extractNetworkMetrics(timing: PerformanceResourceTiming): NetworkMetrics {
  return {

    domainLookupTime: timing.domainLookupEnd - timing.domainLookupStart,

    connectTime: timing.connectEnd - timing.connectStart,

    ttfb: timing.responseStart - timing.requestStart,

    downloadTime: timing.responseEnd - timing.responseStart,
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); measureNetworkRequest(
  url: string,
  options: RequestInit = {},
): Promise<{ metrics: NetworkMetrics | undefined }> {
  const start = performance.now();

  try {
    const end = performance.now();

    // Get timing metrics from the Performance API if available
    const entry = performance.getEntriesByName(url)[0] as PerformanceResourceTiming;

    if (entry) {
      return {
        metrics: {

          domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,

          connectTime: entry.connectEnd - entry.connectStart,

          ttfb: entry.responseStart - entry.requestStart,

          downloadTime: entry.responseEnd - entry.responseStart,
// Fallback to basic timing if Performance API is not available
    return {
      metrics: {
        domainLookupTime: 0,
        connectTime: 0,

        ttfb: end - start,
        downloadTime: 0,
catch (error) {
    console.error('Error measuring network request:', error);
    return { metrics: undefined };
export interface PerformanceReport {
  timestamp: string;
  metrics: {
    memory?: MemoryMetrics;
    network?: NetworkMetrics;
    fps?: number;
    executionTime?: number;
export function createPerformanceReport(
  metrics: Partial<PerformanceReport['metrics']>,
): PerformanceReport {
  return {
    timestamp: new Date().toISOString(),
    metrics,
