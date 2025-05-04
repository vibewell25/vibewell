
import { PrismaClient } from '@prisma/client';

import { databaseConfig } from '../config/database';

import { performanceMonitor } from './performance-monitoring';

class DatabaseReplicaManager {
  private static instance: DatabaseReplicaManager;
  private primaryClient: PrismaClient;
  private replicaClients: PrismaClient[] = [];
  private currentReplicaIndex = 0;

  private constructor() {
    this.initializePrimaryConnection();
    this.initializeReplicaConnections();
  }

  public static getInstance(): DatabaseReplicaManager {
    if (!DatabaseReplicaManager.instance) {
      DatabaseReplicaManager.instance = new DatabaseReplicaManager();
    }
    return DatabaseReplicaManager.instance;
  }

  private initializePrimaryConnection(): void {
    this.primaryClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseConfig.primary.url,
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    // Monitor query performance
    this.primaryClient.$on('query', (e: any) => {
      const duration = e.duration;
      performanceMonitor.trackMetric('db_query_duration', duration);

      if (duration > databaseConfig.monitoring.slowQueryThreshold) {
        performanceMonitor.trackMetric('db_slow_query_count', 1);
        if (databaseConfig.monitoring.logSlowQueries) {
          console.warn(`Slow query detected (${duration}ms):`, e.query);
        }
      }
    });
  }

  private initializeReplicaConnections(): void {
    this.replicaClients = databaseConfig.replicas.urls.map(
      (url) =>
        new PrismaClient({
          datasources: {
            db: { url },
          },
          log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
          ],
        }),
    );

    // Monitor replica performance
    this.replicaClients.forEach((client, index) => {
      client.$on('query', (e: any) => {
        const duration = e.duration;
        performanceMonitor.trackMetric(`db_replica_${index}_query_duration`, duration);
      });
    });
  }

  public getPrimaryClient(): PrismaClient {
    return this.primaryClient;
  }

  public getReplicaClient(): PrismaClient {
    if (this.replicaClients.length === 0) {
      return this.primaryClient;
    }


    // Round-robin selection of replica
    const client = this.replicaClients[this.currentReplicaIndex];

    this.currentReplicaIndex = (this.currentReplicaIndex + 1) % this.replicaClients.length;
    return client;
  }

  public async healthCheck(): Promise<{
    primary: boolean;
    replicas: boolean[];
  }> {
    const checkConnection = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');client: PrismaClient): Promise<boolean> => {
      try {
        await client.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        console.error('Database connection check failed:', error);
        return false;
      }
    };

    const primary = await checkConnection(this.primaryClient);
    const replicas = await Promise.all(
      this.replicaClients.map((client) => checkConnection(client)),
    );

    return { primary, replicas };
  }

  public async disconnect(): Promise<void> {
    await Promise.all([
      this.primaryClient.$disconnect(),
      ...this.replicaClients.map((client) => client.$disconnect()),
    ]);
  }
}

export {};
