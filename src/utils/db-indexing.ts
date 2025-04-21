import { PrismaClient } from '@prisma/client';
import { dbOptimizer } from './db-optimization';
import { performanceMonitor } from './performance-monitoring';

interface IndexConfig {
  table: string;
  columns: string[];
  type: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
  unique?: boolean;
  partial?: string;
  name?: string;
}

interface IndexAnalysis {
  table: string;
  missingIndexes: IndexConfig[];
  unusedIndexes: string[];
  fragmentedIndexes: {
    name: string;
    fragmentation: number;
  }[];
}

class DatabaseIndexing {
  private static instance: DatabaseIndexing;
  private prisma: PrismaClient;
  private indexConfigs: IndexConfig[] = [];

  private constructor() {
    this.prisma = dbOptimizer.getPrismaClient();
    this.initializeDefaultIndexes();
  }

  private initializeDefaultIndexes() {
    this.indexConfigs = [
      // User-related indexes
      {
        table: 'User',
        columns: ['email'],
        type: 'BTREE',
        unique: true,
      },
      {
        table: 'User',
        columns: ['createdAt'],
        type: 'BTREE',
      },
      // Event-related indexes
      {
        table: 'Event',
        columns: ['startDate', 'endDate'],
        type: 'BTREE',
      },
      {
        table: 'Event',
        columns: ['organizerId'],
        type: 'BTREE',
      },
      // Notification-related indexes
      {
        table: 'Notification',
        columns: ['userId', 'createdAt'],
        type: 'BTREE',
      },
      {
        table: 'Notification',
        columns: ['status'],
        type: 'HASH',
      },
      // Search-related indexes
      {
        table: 'Event',
        columns: ['title', 'description'],
        type: 'GIN',
        name: 'event_search_idx',
      },
      // Geospatial indexes
      {
        table: 'Venue',
        columns: ['location'],
        type: 'GIST',
        name: 'venue_location_idx',
      },
    ];
  }

  public static getInstance(): DatabaseIndexing {
    if (!DatabaseIndexing.instance) {
      DatabaseIndexing.instance = new DatabaseIndexing();
    }
    return DatabaseIndexing.instance;
  }

  public async analyzeIndexes(): Promise<IndexAnalysis[]> {
    const results: IndexAnalysis[] = [];

    for (const config of this.indexConfigs) {
      const analysis = await this.analyzeTableIndexes(config.table);
      results.push(analysis);
    }

    return results;
  }

  private async analyzeTableIndexes(table: string): Promise<IndexAnalysis> {
    const startTime = performance.now();

    try {
      // Get existing indexes
      const existingIndexes = await this.prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = ${table.toLowerCase()};
      `;

      // Get index usage statistics
      const indexUsage = await this.prisma.$queryRaw<Array<{ indexrelname: string; idx_scan: number }>>`
        SELECT indexrelname, idx_scan
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public' AND relname = ${table.toLowerCase()};
      `;

      // Get index fragmentation
      const fragmentation = await this.prisma.$queryRaw<Array<{ indexrelname: string; fragmentation: number }>>`
        SELECT i.indexrelname,
               (100 * (n_dead_tuple::float / nullif(n_live_tuple + n_dead_tuple, 0)))::numeric(10,2) as fragmentation
        FROM pg_stat_user_indexes i
        JOIN pg_stat_user_tables t ON i.relid = t.relid
        WHERE i.schemaname = 'public' AND i.relname = ${table.toLowerCase()};
      `;

      // Analyze missing indexes
      const configuredIndexes = this.indexConfigs.filter(c => c.table === table);
      const missingIndexes = configuredIndexes.filter(config => 
        !existingIndexes.some(existing => 
          existing.indexdef.includes(config.columns.join(', '))
        )
      );

      // Find unused indexes
      const unusedIndexes = indexUsage
        .filter(usage => usage.idx_scan === 0)
        .map(usage => usage.indexrelname);

      // Get fragmented indexes
      const fragmentedIndexes = fragmentation
        .filter(f => f.fragmentation > 30)
        .map(f => ({
          name: f.indexrelname,
          fragmentation: f.fragmentation,
        }));

      performanceMonitor.track({
        indexAnalysisTime: performance.now() - startTime,
      });

      return {
        table,
        missingIndexes,
        unusedIndexes,
        fragmentedIndexes,
      };
    } catch (error) {
      console.error(`Error analyzing indexes for table ${table}:`, error);
      throw error;
    }
  }

  public async createMissingIndexes(): Promise<void> {
    const analysis = await this.analyzeIndexes();

    for (const tableAnalysis of analysis) {
      for (const index of tableAnalysis.missingIndexes) {
        await this.createIndex(index);
      }
    }
  }

  private async createIndex(config: IndexConfig): Promise<void> {
    const startTime = performance.now();

    try {
      const indexName = config.name || `idx_${config.table.toLowerCase()}_${config.columns.join('_')}`;
      const columnsStr = config.columns.join(', ');
      const uniqueStr = config.unique ? 'UNIQUE' : '';
      const whereStr = config.partial ? `WHERE ${config.partial}` : '';

      await this.prisma.$executeRaw`
        CREATE ${uniqueStr} INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
        ON ${config.table} USING ${config.type} (${columnsStr})
        ${whereStr};
      `;

      performanceMonitor.track({
        indexCreationTime: performance.now() - startTime,
      });
    } catch (error) {
      console.error(`Error creating index for ${config.table}:`, error);
      throw error;
    }
  }

  public async removeUnusedIndexes(): Promise<void> {
    const analysis = await this.analyzeIndexes();

    for (const tableAnalysis of analysis) {
      for (const indexName of tableAnalysis.unusedIndexes) {
        await this.dropIndex(indexName);
      }
    }
  }

  private async dropIndex(indexName: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        DROP INDEX CONCURRENTLY IF EXISTS ${indexName};
      `;
    } catch (error) {
      console.error(`Error dropping index ${indexName}:`, error);
      throw error;
    }
  }

  public async reindexFragmentedIndexes(fragmentationThreshold: number = 30): Promise<void> {
    const analysis = await this.analyzeIndexes();

    for (const tableAnalysis of analysis) {
      for (const index of tableAnalysis.fragmentedIndexes) {
        if (index.fragmentation > fragmentationThreshold) {
          await this.reindexTable(tableAnalysis.table, index.name);
        }
      }
    }
  }

  private async reindexTable(table: string, indexName: string): Promise<void> {
    const startTime = performance.now();

    try {
      await this.prisma.$executeRaw`
        REINDEX INDEX CONCURRENTLY ${indexName};
      `;

      performanceMonitor.track({
        reindexTime: performance.now() - startTime,
      });
    } catch (error) {
      console.error(`Error reindexing ${indexName}:`, error);
      throw error;
    }
  }

  public async getIndexStats(): Promise<any> {
    return this.prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC;
    `;
  }

  public addIndexConfig(config: IndexConfig): void {
    this.indexConfigs.push(config);
  }

  public removeIndexConfig(table: string, columns: string[]): void {
    this.indexConfigs = this.indexConfigs.filter(
      config => !(config.table === table && 
        config.columns.length === columns.length && 
        config.columns.every((col, i) => col === columns[i]))
    );
  }

  public getIndexConfigs(): IndexConfig[] {
    return [...this.indexConfigs];
  }
}

export const dbIndexing = DatabaseIndexing.getInstance(); 