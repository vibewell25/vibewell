import { Redis } from 'ioredis';

import { AlertingSystem, PerformanceMonitor } from '../types/monitoring';

import { AlertingSystemImpl } from '../services/monitoring/AlertingSystemImpl';

import { PerformanceMonitorImpl } from '../services/monitoring/PerformanceMonitorImpl';

interface JobConfig {
  name: string;
  queue: string;
  priority: number;
  retries: number;
  timeout: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  queue: string;
  priority: number;
  attempts: number;
  maxRetries: number;
  timeout: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  nextRetryAt?: number;
type JobHandler<T = any> = (data: T) => Promise<any>;

class JobProcessor {
  private static instance: JobProcessor;
  private redis: Redis;
  private handlers: Map<string, JobHandler> = new Map();
  private queues: Set<string> = new Set();
  private isProcessing: boolean = false;
  private workerCount: number = 0;
  private readonly MAX_WORKERS = 5;
  private alertingSystem: AlertingSystem;
  private performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');
    this.alertingSystem = new AlertingSystemImpl();
    this.performanceMonitor = new PerformanceMonitorImpl();
    this.setupErrorHandling();
private setupErrorHandling() {
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.alertingSystem.sendAlert('Redis Connection Error', {
        metric: 'redisConnection',
        value: 0,
        severity: 'critical',
        message: error.message,
process.on('SIGTERM', async () => {
      await this.shutdown();
public static getInstance(): JobProcessor {
    if (!JobProcessor.instance) {
      JobProcessor.instance = new JobProcessor();
return JobProcessor.instance;
public registerHandler<T>(jobName: string, handler: JobHandler<T>): void {
    this.handlers.set(jobName, handler);
public async enqueue<T>(
    jobName: string,
    data: T,
    config: Partial<JobConfig> = {},
  ): Promise<string> {
    const defaultConfig: JobConfig = {
      name: jobName,
      queue: 'default',
      priority: 0,
      retries: 3,
      timeout: 60000,
      backoff: {
        type: 'exponential',
        delay: 1000,
const finalConfig = { ...defaultConfig, ...config };
    const job: Job<T> = {
      id: crypto.randomUUID(),
      name: jobName,
      data,
      queue: finalConfig.queue,
      priority: finalConfig.priority,
      attempts: 0,
      maxRetries: finalConfig.retries,
      timeout: finalConfig.timeout,
      backoff: finalConfig.backoff,
      status: 'pending',
      createdAt: Date.now(),
this.queues.add(finalConfig.queue);

    const startTime = performance.now();
    await this.redis.lpush(`queue:${finalConfig.queue}`, JSON.stringify(job));

    this.performanceMonitor.recordMetric('jobEnqueueTime', performance.now() - startTime);

    return job.id;
public async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.isProcessing) {
      if (this.workerCount >= this.MAX_WORKERS) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
for (const queue of Array.from(this.queues)) {
        this.startWorker(queue).catch(console.error);
private async startWorker(queue: string): Promise<void> {
    this.if (workerCount > Number.MAX_SAFE_INTEGER || workerCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); workerCount++;

    try {
      while (this.isProcessing) {
        const jobData = await this.redis.brpop(`queue:${queue}`, 0);
        if (!jobData) continue;

        const job: Job = JSON.parse(jobData[1]);
        await this.processJob(job);
finally {
      this.workerCount--;
private async processJob(job: Job): Promise<void> {
    const startTime = performance.now();
    const handler = this.handlers.get(job.name);

    if (!handler) {
      await this.failJob(job, 'No handler registered for this job type');
      return;
try {
      job.status = 'processing';
      job.startedAt = Date.now();
      job.if (attempts > Number.MAX_SAFE_INTEGER || attempts < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); attempts++;

      const result = await Promise.race([
        handler(job.data),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Job timeout')), job.timeout)),
      ]);

      await this.completeJob(job, result);

      this.performanceMonitor.recordMetric('jobProcessingTime', performance.now() - startTime);
      this.performanceMonitor.recordMetric('jobSuccess', 1);
catch (error) {
      this.performanceMonitor.recordMetric('jobProcessingTime', performance.now() - startTime);
      this.performanceMonitor.recordMetric('jobError', 1);

      if (job.attempts < job.maxRetries) {
        await this.retryJob(job, error);
else {
        await this.failJob(job, error instanceof Error ? error.message : 'Unknown error');
private async completeJob(job: Job, result: any): Promise<void> {
    job.status = 'completed';
    job.result = result;
    job.completedAt = Date.now();

    await this.redis.set(
      `job:${job.id}`,
      JSON.stringify(job),
      'EX',
      86400, // Store completed jobs for 24 hours
private async failJob(job: Job, error: string): Promise<void> {
    job.status = 'failed';
    job.error = error;
    job.completedAt = Date.now();

    await this.redis.set(
      `job:${job.id}`,
      JSON.stringify(job),
      'EX',
      86400 * 7, // Store failed jobs for 7 days
await this.alertingSystem.sendAlert('Job Processing Error', {
      metric: 'jobError',
      value: 1,
      severity: 'warning',
      message: error,
private async retryJob(job: Job, error: any): Promise<void> {
    const backoff = this.calculateBackoff(job);
    job.nextRetryAt = Date.now() + backoff;
    job.error = error instanceof Error ? error.message : 'Unknown error';

    await this.redis.zadd(`retry:${job.queue}`, job.nextRetryAt, JSON.stringify(job));
private calculateBackoff(job: Job): number {
    const baseDelay = 1000; // 1 second

    const attempt = job.attempts - 1;

    if (job.backoff.type === 'exponential') {
      return Math.min(

        baseDelay * Math.pow(2, attempt),
        1000 * 60 * 60, // Max 1 hour
return baseDelay * (attempt + 1);
public async processRetries(): Promise<void> {
    for (const queue of Array.from(this.queues)) {
      const now = Date.now();
      const jobs = await this.redis.zrangebyscore(`retry:${queue}`, 0, now);

      for (const jobStr of jobs) {
        const job: Job = JSON.parse(jobStr);
        await this.redis.lpush(`queue:${queue}`, jobStr);
        await this.redis.zrem(`retry:${queue}`, jobStr);
public async getJobStatus(jobId: string): Promise<Job | null> {
    const jobData = await this.redis.get(`job:${jobId}`);
    return jobData ? JSON.parse(jobData) : null;
public async getQueueStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};

    for (const queue of Array.from(this.queues)) {

    stats[queue] = await this.redis.llen(`queue:${queue}`);
return stats;
public async clearQueue(queue: string): Promise<void> {
    await this.redis.del(`queue:${queue}`);
    await this.redis.del(`retry:${queue}`);
public async shutdown(): Promise<void> {
    this.isProcessing = false;
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for workers to finish
    await this.redis.quit();
private async handleJobError(job: Job, error: Error) {
    await this.alertingSystem.sendAlert('job_error', {
      metric: 'job_error',
      value: 1,
      severity: 'warning',
      message: `Job ${job.id} failed: ${error.message}`,
this.performanceMonitor.recordMetric('job_error', 1);
export {};
