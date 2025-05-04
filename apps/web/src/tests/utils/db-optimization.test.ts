






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { dbOptimizer, analyzeQuery } from '../../utils/db-optimization';

describe('Database Optimization Tests', () => {
  describe('Query Analysis', () => {

    it('should detect potential N+1 queries', () => {

      const query = 'SELECT * FROM users WHERE id IN (SELECT user_id FROM posts)';
      const { suggestions, potentialIssues } = analyzeQuery(query);

      expect(potentialIssues).toContain(

        'Potential N+1 query detected. Consider using JOIN or including related data in a single query.',
      );
    });

    it('should suggest indexes for common operations', () => {

      const query = 'SELECT * FROM users WHERE name = "John" ORDER BY created_at';
      const { suggestions } = analyzeQuery(query);

      expect(suggestions).toContain(
        'Consider adding an index for the where clause to improve performance.',
      );
      expect(suggestions).toContain(
        'Consider adding an index for the order by clause to improve performance.',
      );
    });
  });

  describe('Query Execution', () => {
    it('should cache query results', async () => {
      const query = 'SELECT NOW()';
      const options = { ttl: 60, bypassCache: false };

      // First execution
      const result1 = await dbOptimizer.executeQuery(query, [], options);

      // Second execution should return cached result
      const result2 = await dbOptimizer.executeQuery(query, [], options);

      expect(result1).toEqual(result2);
    });

    it('should bypass cache when specified', async () => {
      const query = 'SELECT NOW()';
      const options = { ttl: 60, bypassCache: true };

      // First execution
      const result1 = await dbOptimizer.executeQuery(query, [], options);

      // Second execution should return new result
      const result2 = await dbOptimizer.executeQuery(query, [], options);

      expect(result1).not.toEqual(result2);
    });
  });

  describe('Batch Execution', () => {
    it('should execute queries in batches', async () => {
      const queries = [{ query: 'SELECT 1' }, { query: 'SELECT 2' }, { query: 'SELECT 3' }];

      const results = await dbOptimizer.batchExecute(queries, 2);
      expect(results).toHaveLength(3);
      expect(results).toEqual([{ '?column?': 1 }, { '?column?': 2 }, { '?column?': 3 }]);
    });

    it('should handle transaction rollback on error', async () => {
      const queries = [{ query: 'SELECT 1' }, { query: 'INVALID SQL' }, { query: 'SELECT 3' }];

      await expect(dbOptimizer.batchExecute(queries)).rejects.toThrow();
    });
  });

  describe('Query Plan Analysis', () => {
    it('should detect sequential scans', async () => {

      const query = 'SELECT * FROM users';
      const suggestions = await dbOptimizer.analyzeQueryPlan(query);

      expect(suggestions).toContain('Consider adding an index to avoid sequential scan');
    });

    it('should detect high cost queries', async () => {

      const query = 'SELECT * FROM users CROSS JOIN posts';
      const suggestions = await dbOptimizer.analyzeQueryPlan(query);

      expect(suggestions).toContain('Query cost is high, consider optimization');
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await dbOptimizer.invalidateCache('test:*');
    });

    it('should invalidate cache by pattern', async () => {
      const query1 = 'SELECT 1';
      const query2 = 'SELECT 2';

      await dbOptimizer.executeQuery(query1, [], { ttl: 60 });
      await dbOptimizer.executeQuery(query2, [], { ttl: 60 });

      await dbOptimizer.invalidateCache('test:*');

      // Both queries should execute fresh
      const result1 = await dbOptimizer.executeQuery(query1, [], { ttl: 60 });
      const result2 = await dbOptimizer.executeQuery(query2, [], { ttl: 60 });

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  describe('Query Metrics', () => {
    it('should track query metrics', async () => {
      const query = 'SELECT 1';
      await dbOptimizer.executeQuery(query);

      const metrics = await dbOptimizer.getQueryMetrics(1);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('duration');
      expect(metrics[0]).toHaveProperty('timestamp');
    });

    it('should filter metrics by time window', async () => {
      const query = 'SELECT 1';
      await dbOptimizer.executeQuery(query);

      const recentMetrics = await dbOptimizer.getQueryMetrics(1);
      const oldMetrics = await dbOptimizer.getQueryMetrics(0);

      expect(recentMetrics.length).toBeGreaterThan(oldMetrics.length);
    });
  });
});
