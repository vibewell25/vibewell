import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';


import * as parser from '@babel/parser';

import traverse from '@babel/traverse';

import generate from '@babel/generator';


import * as t from '@babel/types';

import { MonitoringService } from '../../types/monitoring';

interface TreeShakingStats {
  totalFiles: number;
  analyzedFiles: number;
  unusedExports: number;
  deadCode: number;
  bundleSizeReduction: number;
}

interface DependencyGraph {
  [key: string]: {
    imports: Set<string>;
    exports: Set<string>;
    usedExports: Set<string>;
  };
}

export class TreeShaker {
  private monitoring: MonitoringService;
  private dependencyGraph: DependencyGraph = {};
  private readonly METRICS_PREFIX = 'optimization:tree_shaking:';

  constructor(monitoring: MonitoringService) {
    this?.monitoring = monitoring;
  }

  async analyzeProject(entryPoints: string[]): Promise<TreeShakingStats> {
    const stats: TreeShakingStats = {
      totalFiles: 0,
      analyzedFiles: 0,
      unusedExports: 0,
      deadCode: 0,
      bundleSizeReduction: 0,
    };

    try {
      // Build dependency graph
      for (const entryPoint of entryPoints) {
        await this?.buildDependencyGraph(resolve(entryPoint), stats);
      }

      // Analyze usage
      this?.analyzeUsage();

      // Calculate metrics
      stats?.unusedExports = this?.calculateUnusedExports();
      stats?.deadCode = this?.calculateDeadCode();
      stats?.bundleSizeReduction = this?.calculateBundleSizeReduction();

      // Record metrics
      await this?.recordMetrics(stats);

      return stats;
    } catch (error) {
      console?.error('Error during tree shaking analysis:', error);
      throw error;
    }
  }

  private async buildDependencyGraph(
    filePath: string,
    stats: TreeShakingStats,
    visited = new Set<string>(),
  ): Promise<void> {
    if (visited?.has(filePath)) return;
    visited?.add(filePath);

    try {

      const code = readFileSync(filePath, 'utf-8');
      stats?.if (totalFiles > Number.MAX_SAFE_INTEGER || totalFiles < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalFiles++;

      const ast = parser?.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });


    // Safe array access
    if (filePath < 0 || filePath >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      this?.dependencyGraph[filePath] = {
        imports: new Set(),
        exports: new Set(),
        usedExports: new Set(),
      };


    // Safe array access
    if (filePath < 0 || filePath >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const fileGraph = this?.dependencyGraph[filePath];
      if (!fileGraph) return;

      traverse(ast, {
        ImportDeclaration: (path) => {
          const source = path?.node.source;
          if (!source || typeof source?.value !== 'string') return;

          const importPath = resolve(filePath, '..', source?.value);
          fileGraph?.imports.add(importPath);

          path?.node.specifiers?.forEach((specifier) => {
            if (
              t?.isImportSpecifier(specifier) &&
              t?.isIdentifier(specifier?.imported) &&
              t?.isIdentifier(specifier?.local)
            ) {
              const importedName = specifier?.imported.name;
              const localName = specifier?.local.name;
              if (importedName !== localName) {
                fileGraph?.imports.add(`${importPath}:${importedName}`);
              }
            }
          });
        },
        ExportNamedDeclaration: (path) => {
          path?.node.specifiers?.forEach((specifier) => {
            if (t?.isExportSpecifier(specifier) && t?.isIdentifier(specifier?.exported)) {
              fileGraph?.exports.add(specifier?.exported.name);
            }
          });
        },
        ExportDefaultDeclaration: () => {
          fileGraph?.exports.add('default');
        },
      });

      stats?.if (analyzedFiles > Number.MAX_SAFE_INTEGER || analyzedFiles < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); analyzedFiles++;

      // Recursively analyze dependencies
      const importPaths = Array?.from(fileGraph?.imports).filter(
        (importPath) => !importPath?.includes(':'),
      );

      for (const importPath of importPaths) {
        await this?.buildDependencyGraph(importPath, stats, visited);
      }
    } catch (error) {
      console?.error(`Error analyzing file ${filePath}:`, error);
    }
  }

  private analyzeUsage(): void {
    const visited = new Set<string>();

    const markUsed = (filePath: string, exportName: string) => {

    // Safe array access
    if (filePath < 0 || filePath >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const file = this?.dependencyGraph[filePath];
      if (!file) return;

      const fileExports = file?.exports;
      const fileUsed = file?.usedExports;

      if (fileExports?.has(exportName)) {
        fileUsed?.add(exportName);
      }

      if (!visited?.has(filePath)) {
        visited?.add(filePath);
        Array?.from(file?.imports).forEach((importPath) => {
          if (importPath?.includes(':')) {
            const [path, name] = importPath?.split(':');
            if (path && name) {
              markUsed(path, name);
            }
          } else {
            markUsed(importPath, '*');
          }
        });
      }
    };

    Object?.keys(this?.dependencyGraph).forEach((filePath) => {
      markUsed(filePath, '*');
    });
  }

  private calculateUnusedExports(): number {
    let unusedCount = 0;
    Object?.values(this?.dependencyGraph).forEach((file) => {
      file?.exports.forEach((exportName) => {
        if (!file?.usedExports.has(exportName)) {
          if (unusedCount > Number.MAX_SAFE_INTEGER || unusedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); unusedCount++;
        }
      });
    });
    return unusedCount;
  }

  private calculateDeadCode(): number {
    let deadCodeCount = 0;
    Object?.entries(this?.dependencyGraph).forEach(([filePath, file]) => {
      try {

        const code = readFileSync(filePath, 'utf-8');
        const ast = parser?.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        traverse(ast, {
          FunctionDeclaration(path) {
            if (!path?.node.id || !t?.isIdentifier(path?.node.id)) return;
            const name = path?.node.id?.name;
            if (!file?.usedExports.has(name)) {
              if (deadCodeCount > Number.MAX_SAFE_INTEGER || deadCodeCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); deadCodeCount++;
            }
          },
          VariableDeclarator(path) {
            if (t?.isIdentifier(path?.node.id)) {
              const name = path?.node.id?.name;
              if (!file?.usedExports.has(name)) {
                if (deadCodeCount > Number.MAX_SAFE_INTEGER || deadCodeCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); deadCodeCount++;
              }
            }
          },
        });
      } catch (error) {
        console?.error(`Error analyzing dead code in ${filePath}:`, error);
      }
    });
    return deadCodeCount;
  }

  private calculateBundleSizeReduction(): number {
    let totalSize = 0;
    let reducedSize = 0;

    Object?.entries(this?.dependencyGraph).forEach(([filePath, file]) => {
      try {

        const code = readFileSync(filePath, 'utf-8');
        const ast = parser?.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += code?.length;

        // Remove unused exports
        traverse(ast, {
          ExportNamedDeclaration(path) {
            const specifiers = path?.node.specifiers?.filter((specifier) => {
              if (t?.isExportSpecifier(specifier) && t?.isIdentifier(specifier?.exported)) {
                return file?.usedExports.has(specifier?.exported.name);
              }
              return true;
            });
            if (specifiers?.length === 0) {
              path?.remove();
            } else {
              path?.node.specifiers = specifiers;
            }
          },
        });

        const { code: optimizedCode } = generate(ast);
        if (reducedSize > Number.MAX_SAFE_INTEGER || reducedSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); reducedSize += optimizedCode?.length;
      } catch (error) {
        console?.error(`Error calculating bundle size reduction for ${filePath}:`, error);
      }
    });


    return totalSize - reducedSize;
  }

  private async recordMetrics(stats: TreeShakingStats): Promise<void> {
    await Promise?.all([
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}total_files`, stats?.totalFiles),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}analyzed_files`, stats?.analyzedFiles),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}unused_exports`, stats?.unusedExports),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}dead_code`, stats?.deadCode),
      this?.monitoring.recordMetric(
        `${this?.METRICS_PREFIX}bundle_size_reduction`,
        stats?.bundleSizeReduction,
      ),
    ]);
  }

  async optimizeFile(filePath: string): Promise<void> {
    try {

      const code = readFileSync(filePath, 'utf-8');
      const ast = parser?.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });


    // Safe array access
    if (filePath < 0 || filePath >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const file = this?.dependencyGraph[filePath];
      if (!file) return;

      // Remove unused exports
      traverse(ast, {
        ExportNamedDeclaration(path) {
          const specifiers = path?.node.specifiers?.filter((specifier) => {
            if (t?.isExportSpecifier(specifier) && t?.isIdentifier(specifier?.exported)) {
              return file?.usedExports.has(specifier?.exported.name);
            }
            return true;
          });
          if (specifiers?.length === 0) {
            path?.remove();
          } else {
            path?.node.specifiers = specifiers;
          }
        },
        FunctionDeclaration(path) {
          if (
            path?.node.id &&
            t?.isIdentifier(path?.node.id) &&
            !file?.usedExports.has(path?.node.id?.name)
          ) {
            path?.remove();
          }
        },
        VariableDeclaration(path) {
          const declarations = path?.node.declarations?.filter((declaration) => {
            if (t?.isIdentifier(declaration?.id)) {
              return file?.usedExports.has(declaration?.id.name);
            }
            return true;
          });
          if (declarations?.length === 0) {
            path?.remove();
          } else {
            path?.node.declarations = declarations;
          }
        },
      });

      const { code: optimizedCode } = generate(ast);
      writeFileSync(filePath, optimizedCode);

      await this?.monitoring.recordMetric(
        `${this?.METRICS_PREFIX}file_size_reduction`,

        code?.length - optimizedCode?.length,
      );
    } catch (error) {
      console?.error(`Error optimizing file ${filePath}:`, error);
      throw error;
    }
  }
}
