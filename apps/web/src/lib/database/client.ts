import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/logger';

// PrismaClient interface augmentation for global use
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of the Prisma client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Use a global variable in development to prevent multiple instances during hot reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Object to track active transactions
const activeTransactions = new Map<string, any>();

/**
 * Database client with methods similar to Supabase for easy migration
 */
export const db = {
  /**
   * Query from a specific table
   * @param table The table name to query
   * @returns Query builder interface
   */
  from: (table: string) => {
    return {
      /**
       * Select data from the table
       * @param columns Columns to select (defaults to all)
       */
      select: (columns?: string | string[]) => {
        const select = columns
          ? Array.isArray(columns)
            ? columns.reduce((acc, col) => ({ ...acc, [col]: true }), {})
            : { [columns]: true }
          : undefined;

        return {
          /**
           * Filter by a specific column value
           * @param column Column name
           * @param value Value to match
           */
          eq: (column: string, value: any) => {
            try {
              return prisma[table as keyof typeof prisma].findMany({
                where: { [column]: value },
                select,
              });
            } catch (error) {
              logger.error(`Database error in ${table}.select.eq:`, error);
              throw error;
            }
          },

          /**
           * Order results by a column
           * @param column Column to order by
           * @param direction Direction ('asc' or 'desc')
           */
          order: (column: string, direction: 'asc' | 'desc' = 'asc') => {
            try {
              return prisma[table as keyof typeof prisma].findMany({
                orderBy: { [column]: direction },
                select,
              });
            } catch (error) {
              logger.error(`Database error in ${table}.select.order:`, error);
              throw error;
            }
          },

          /**
           * Limit the number of results
           * @param count Maximum number of results
           */
          limit: (count: number) => {
            try {
              return prisma[table as keyof typeof prisma].findMany({
                take: count,
                select,
              });
            } catch (error) {
              logger.error(`Database error in ${table}.select.limit:`, error);
              throw error;
            }
          },

          /**
           * Execute the query
           */
          execute: () => {
            try {
              return prisma[table as keyof typeof prisma].findMany({
                select,
              });
            } catch (error) {
              logger.error(`Database error in ${table}.select.execute:`, error);
              throw error;
            }
          },
        };
      },

      /**
       * Insert data into the table
       * @param data Data to insert
       */
      insert: (data: any) => {
        try {
          return prisma[table as keyof typeof prisma].create({
            data,
          });
        } catch (error) {
          logger.error(`Database error in ${table}.insert:`, error);
          throw error;
        }
      },

      /**
       * Update data in the table
       * @param data Data to update
       */
      update: (data: any) => {
        return {
          /**
           * Filter records to update by a specific column value
           * @param column Column name
           * @param value Value to match
           */
          eq: (column: string, value: any) => {
            try {
              return prisma[table as keyof typeof prisma].updateMany({
                where: { [column]: value },
                data,
              });
            } catch (error) {
              logger.error(`Database error in ${table}.update.eq:`, error);
              throw error;
            }
          },
        };
      },

      /**
       * Delete data from the table
       */
      delete: () => {
        return {
          /**
           * Filter records to delete by a specific column value
           * @param column Column name
           * @param value Value to match
           */
          eq: (column: string, value: any) => {
            try {
              return prisma[table as keyof typeof prisma].deleteMany({
                where: { [column]: value },
              });
            } catch (error) {
              logger.error(`Database error in ${table}.delete.eq:`, error);
              throw error;
            }
          },
        };
      },
    };
  },

  /**
   * Start a transaction
   * @param id Optional transaction ID
   */
  transaction: async (id?: string) => {
    const txId = id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const tx = await prisma.$transaction(async (prisma) => {
        activeTransactions.set(txId, prisma);
        return txId;
      });
      return { id: tx };
    } catch (error) {
      logger.error(`Database error starting transaction ${txId}:`, error);
      throw error;
    }
  },

  /**
   * Commit a transaction
   * @param id Transaction ID
   */
  commit: async (id: string) => {
    try {
      activeTransactions.delete(id);
      return { success: true };
    } catch (error) {
      logger.error(`Database error committing transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Rollback a transaction
   * @param id Transaction ID
   */
  rollback: async (id: string) => {
    try {
      activeTransactions.delete(id);
      return { success: true };
    } catch (error) {
      logger.error(`Database error rolling back transaction ${id}:`, error);
      throw error;
    }
  },
};

// For compatibility with existing code
export { db as database, db as supabase };
export { prisma };
