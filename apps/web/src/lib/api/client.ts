import { ApiResponse } from '@/types/api';

import { API_CONFIG } from '../../config/api';
import { requestInterceptor, responseInterceptor } from './interceptors';
import { ApiRequestError, NetworkError, TimeoutError } from './errors';

import { apiCache } from '../cache/api-cache';

/**
 * API client options
 */
export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
/**
 * Request options
 */
export interface RequestOptions extends ApiClientOptions {
  method: string;
  body?: any;
  signal?: AbortSignal;
  cache?: boolean;
/**
 * API client class
 */
export class ApiClient {
  private baseUrl: string;
  private defaultOptions: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || API_CONFIG.baseUrl;
    this.defaultOptions = {
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
timeout: options.timeout || API_CONFIG.timeout,
      retryAttempts: options.retryAttempts || API_CONFIG.retryAttempts,
      retryDelay: options.retryDelay || API_CONFIG.retryDelay,
      cache: options.cache ?? API_CONFIG.cache.enabled,
/**
   * Make a GET request
   */
  async get<T>(path: string, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
/**
   * Make a POST request
   */
  async post<T>(path: string, data?: any, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data,
/**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data,
/**
   * Make a DELETE request
   */
  async delete<T>(path: string, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
/**
   * Make a PATCH request
   */
  async patch<T>(
    path: string,
    data?: any,
    options: ApiClientOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data,
/**
   * Make an HTTP request
   */
  private async request<T>(path: string, options: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const mergedOptions = this.mergeOptions(options);
    const controller = new AbortController();
    const timeoutId = mergedOptions.timeout
      ? setTimeout(() => controller.abort(), mergedOptions.timeout)
      : null;

    try {
      // Check cache for GET requests
      if (options.method === 'GET' && mergedOptions.cache) {
        const cached = apiCache.get<T>(url);
        if (cached) {
          return cached;
const request = new Request(url, {
        method: options.method,
        headers: mergedOptions.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
// Apply request interceptor
      const interceptedRequest = await requestInterceptor(request, mergedOptions);

      // Make the request with retry logic
      const response = await this.executeWithRetry(
        () => fetch(interceptedRequest),
        mergedOptions.retryAttempts || 0,
        mergedOptions.retryDelay || 0,
// Apply response interceptor
      const result = await responseInterceptor(response);

      // Cache successful GET responses
      if (options.method === 'GET' && mergedOptions.cache && result.success) {
        apiCache.set(url, result);
return result as ApiResponse<T>;
catch (error) {
      if (
        error instanceof ApiRequestError ||
        error instanceof NetworkError ||
        error instanceof TimeoutError
      ) {
        throw error;
throw new NetworkError(error instanceof Error ? error.message : 'Network request failed');
finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
/**
   * Build full URL from path
   */
  private buildUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
/**
   * Merge default options with request options
   */
  private mergeOptions(options: RequestOptions): RequestOptions {
    return {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
/**
   * Execute a request with retry logic
   */
  private async executeWithRetry(
    fn: () => Promise<Response>,
    retries: number,
    delay: number,
  ): Promise<Response> {
    try {
      return await fn();
catch (error) {
      if (retries === 0 || error instanceof TimeoutError) {
        throw error;
await new Promise((resolve) => setTimeout(resolve, delay));


      return this.executeWithRetry(fn, retries - 1, delay);
// Export a default instance
export {};
