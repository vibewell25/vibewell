import { Redis } from 'ioredis';
import { performance } from 'perf_hooks';
import { MonitoringService } from '../../types/monitoring';
import { v4 as uuidv4 } from 'uuid';

interface JobData {
  id: string;
  type: string;
  payload: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: number;
  processedAt?: number;
  completedAt?: number;
  error?: string;
}

interface JobOptions {
  priority?: number;
  maxAttempts?: number;
  delay?: number;
}

type JobHandler = (payload: any) => Promise<void>;

export class JobQueue {
  private redis: Redis;
  private monitoring: MonitoringService;
  private handlers: Map<string, JobHandler>;
  private isProcessing: boolean;
  private readonly QUEUE_KEY = 'vibewell:jobs';
  private readonly PROCESSING_KEY = 'vibewell:jobs:processing';
  private readonly COMPLETED_KEY = 'vibewell:jobs:completed';
  private readonly FAILED_KEY = 'vibewell:jobs:failed';
  private readonly METRICS_PREFIX = 'jobs:';

  constructor(monitoring: MonitoringService, redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env['REDIS_URL'] || 'redis://localhost:6379');
    this.monitoring = monitoring;
    this.handlers = new Map();
    this.isProcessing = false;
  }

  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  async enqueue(type: string, payload: any, options: JobOptions = {}): Promise<string> {
    if (!this.handlers.has(type)) {
      throw new Error(`No handler registered for job type: ${type}`);
    }

    const job: JobData = {
      id: uuidv4(),
      type,
      payload,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      delay: options.delay,
      createdAt: Date.now()
    };

    const score = job.priority * -1; // Higher priority = lower score
    await this.redis.zadd(this.QUEUE_KEY, score, JSON.stringify(job));
    await this.monitoring.recordMetric(`${this.METRICS_PREFIX}enqueued`, 1);

    return job.id;
  }

  async start(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        const job = await this.getNextJob();
        if (job) {
          await this.processJob(job);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error processing job:', error);
        await this.monitoring.recordMetric(`${this.METRICS_PREFIX}errors`, 1);
      }
    }
  }

  async stop(): Promise<void> {
    this.isProcessing = false;
  }

  private async getNextJob(): Promise<JobData | null> {
    const now = Date.now();
    const jobs = await this.redis.zrange(this.QUEUE_KEY, 0, 0, 'WITHSCORES');
    
    if (jobs.length === 0) return null;

    const jobData: JobData = JSON.parse(jobs[0]);
    if (jobData.delay && now < jobData.createdAt + jobData.delay) {
      return null;
    }

    await this.redis.zrem(this.QUEUE_KEY, jobs[0]);
    await this.redis.zadd(this.PROCESSING_KEY, now, JSON.stringify({
      ...jobData,
      processedAt: now
    }));

    return jobData;
  }

  private async processJob(job: JobData): Promise<void> {
    const start = performance.now();
    const handler = this.handlers.get(job.type)!;

    try {
      await handler(job.payload);
      const duration = performance.now() - start;

      const completedJob = {
        ...job,
        completedAt: Date.now()
      };

      await Promise.all([
        this.redis.zrem(this.PROCESSING_KEY, JSON.stringify(job)),
        this.redis.zadd(this.COMPLETED_KEY, Date.now(), JSON.stringify(completedJob)),
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}completed`, 1),
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}duration`, duration)
      ]);
    } catch (error) {
      job.attempts++;
      job.error = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts < job.maxAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, job.attempts) * 1000;
        job.delay = delay;
        job.createdAt = Date.now();

        await Promise.all([
          this.redis.zrem(this.PROCESSING_KEY, JSON.stringify(job)),
          this.redis.zadd(this.QUEUE_KEY, job.priority * -1, JSON.stringify(job)),
          this.monitoring.recordMetric(`${this.METRICS_PREFIX}retries`, 1)
        ]);
      } else {
        await Promise.all([
          this.redis.zrem(this.PROCESSING_KEY, JSON.stringify(job)),
          this.redis.zadd(this.FAILED_KEY, Date.now(), JSON.stringify(job)),
          this.monitoring.recordMetric(`${this.METRICS_PREFIX}failed`, 1)
        ]);
      }
    }
  }

  async getStats(): Promise<{
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    retries: number;
  }> {
    const [queued, processing, completed, failed] = await Promise.all([
      this.redis.zcard(this.QUEUE_KEY),
      this.redis.zcard(this.PROCESSING_KEY),
      this.redis.zcard(this.COMPLETED_KEY),
      this.redis.zcard(this.FAILED_KEY)
    ]);

    return {
      queued,
      processing,
      completed,
      failed,
      retries: await this.redis.get(`${this.METRICS_PREFIX}retries`).then(Number) || 0
    };
  }

  async cleanup(olderThan: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - olderThan;

    await Promise.all([
      this.redis.zremrangebyscore(this.COMPLETED_KEY, '-inf', cutoff),
      this.redis.zremrangebyscore(this.FAILED_KEY, '-inf', cutoff)
    ]);
  }

  async retryFailed(): Promise<number> {
    const failedJobs = await this.redis.zrange(this.FAILED_KEY, 0, -1);
    let retriedCount = 0;

    for (const jobStr of failedJobs) {
      const job: JobData = JSON.parse(jobStr);
      job.attempts = 0;
      job.error = undefined;
      job.createdAt = Date.now();

      await Promise.all([
        this.redis.zrem(this.FAILED_KEY, jobStr),
        this.redis.zadd(this.QUEUE_KEY, job.priority * -1, JSON.stringify(job))
      ]);

      retriedCount++;
    }

    await this.monitoring.recordMetric(`${this.METRICS_PREFIX}retried_failed`, retriedCount);
    return retriedCount;
  }
} 