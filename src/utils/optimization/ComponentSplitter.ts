import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { MonitoringService } from '../../types/monitoring';

interface SplitConfig {
  minSize: number;
  maxSize: number;
  automaticPrefetch: boolean;
}

interface SplitResult {
  originalPath: string;
  chunks: {
    path: string;
    size: number;
    imports: string[];
  }[];
  totalSize: number;
  reductionPercentage: number;
}

export class ComponentSplitter {
  private monitoring: MonitoringService;
  private readonly METRICS_PREFIX = 'optimization:code_splitting:';
  private config: SplitConfig;

  constructor(monitoring: MonitoringService, config?: Partial<SplitConfig>) {
    this.monitoring = monitoring;
    this.config = {
      minSize: config?.minSize ?? 10000,
      maxSize: config?.maxSize ?? 244000,
      automaticPrefetch: config?.automaticPrefetch ?? true
    };
  }

  async splitComponent(componentPath: string): Promise<SplitResult> {
    const start = performance.now();
    try {
      const code = readFileSync(componentPath, 'utf-8');
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy']
      });

      const chunks: SplitResult['chunks'] = [];
      const imports = new Set<string>();
      let currentChunkSize = 0;
      let totalSize = 0;

      // Find all imports
      traverse(ast, {
        ImportDeclaration: (path) => {
          if (path.node.source.value.startsWith('.')) {
            const importPath = resolve(dirname(componentPath), path.node.source.value);
            imports.add(importPath);
          }
        }
      });

      // Find splittable components
      traverse(ast, {
        FunctionDeclaration: (path) => {
          if (this.isComponent(path) && this.shouldSplit(path)) {
            const { code: componentCode } = generate(path.node);
            const size = componentCode.length;

            if (size > this.config.minSize) {
              const chunkPath = this.createChunkPath(componentPath, path.node.id?.name || 'Component');
              this.extractComponentToChunk(path, chunkPath);
              chunks.push({
                path: chunkPath,
                size,
                imports: Array.from(imports)
              });
              currentChunkSize += size;
            }
          }
        },
        ArrowFunctionExpression: (path) => {
          if (this.isComponent(path) && this.shouldSplit(path)) {
            const { code: componentCode } = generate(path.node);
            const size = componentCode.length;

            if (size > this.config.minSize) {
              const parentName = this.getComponentName(path);
              const chunkPath = this.createChunkPath(componentPath, parentName);
              this.extractComponentToChunk(path, chunkPath);
              chunks.push({
                path: chunkPath,
                size,
                imports: Array.from(imports)
              });
              currentChunkSize += size;
            }
          }
        }
      });

      totalSize = code.length;
      const duration = performance.now() - start;

      await Promise.all([
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}split_time`, duration),
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}chunks_created`, chunks.length),
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}total_size`, totalSize),
        this.monitoring.recordMetric(`${this.METRICS_PREFIX}split_size`, currentChunkSize)
      ]);

      return {
        originalPath: componentPath,
        chunks,
        totalSize,
        reductionPercentage: (currentChunkSize / totalSize) * 100
      };
    } catch (error) {
      console.error(`Error splitting component ${componentPath}:`, error);
      throw error;
    }
  }

  private isComponent(path: any): boolean {
    // Check if it's a React component
    if (path.node.type === 'FunctionDeclaration') {
      return (
        path.node.id &&
        /^[A-Z]/.test(path.node.id.name) &&
        this.hasJSXReturn(path)
      );
    }

    if (path.node.type === 'ArrowFunctionExpression') {
      const parent = path.findParent((p: any) => p.isVariableDeclaration());
      return (
        parent &&
        parent.node.declarations[0]?.id?.name &&
        /^[A-Z]/.test(parent.node.declarations[0].id.name) &&
        this.hasJSXReturn(path)
      );
    }

    return false;
  }

  private hasJSXReturn(path: any): boolean {
    let hasJSX = false;
    traverse(path.node, {
      ReturnStatement(returnPath) {
        traverse(returnPath.node, {
          JSXElement() {
            hasJSX = true;
          },
          JSXFragment() {
            hasJSX = true;
          }
        }, path.scope);
      }
    }, path.scope);
    return hasJSX;
  }

  private shouldSplit(path: any): boolean {
    const { code } = generate(path.node);
    const size = code.length;
    return size > this.config.minSize && size < this.config.maxSize;
  }

  private createChunkPath(originalPath: string, componentName: string): string {
    const dir = dirname(originalPath);
    const chunkName = `${componentName}.chunk.tsx`;
    return join(dir, 'chunks', chunkName);
  }

  private getComponentName(path: any): string {
    const parent = path.findParent((p: any) => p.isVariableDeclaration());
    return parent?.node.declarations[0]?.id?.name || 'Component';
  }

  private extractComponentToChunk(path: any, chunkPath: string): void {
    const { code: componentCode } = generate(path.node);
    const imports = new Set<string>();

    // Collect imports
    traverse(path.node, {
      ImportDeclaration: (importPath) => {
        imports.add(generate(importPath.node).code);
      }
    }, path.scope);

    // Create dynamic import wrapper
    const componentName = this.getComponentName(path);
    const wrapperCode = `
import dynamic from 'next/dynamic';
${Array.from(imports).join('\n')}

export const ${componentName} = dynamic(() => import('${chunkPath}'), {
  loading: () => <div>Loading...</div>,
  ssr: true,
  ${this.config.automaticPrefetch ? 'prefetch: true,' : ''}
});
    `.trim();

    // Write the chunk file
    writeFileSync(chunkPath, componentCode);

    // Replace the original component with the dynamic import wrapper
    const wrapperAst = parser.parse(wrapperCode, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    path.replaceWith(wrapperAst.program.body[0]);
  }
} 