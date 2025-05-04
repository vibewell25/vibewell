/**
 * Component Standardization Utilities
 * Provides tools for component auditing, guidelines, and refactoring
 */

import React, {
  ComponentType,
  ReactNode,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import fs from 'fs';
import path from 'path';
import { auditComponent } from './component-audit';

// Component categories for organization
export enum ComponentCategory {
  Layout = 'layout',
  Navigation = 'navigation',
  Form = 'form',
  Display = 'display',
  Feedback = 'feedback',
  AR = 'ar',
  Media = 'media',
  Chart = 'chart',
  Utility = 'utility',
}

// Component complexity levels
export enum ComponentComplexity {
  Simple = 'simple', // Basic UI elements (Button, Text, Icon)
  Compound = 'compound', // Multiple simple components composed (Card, Form Field)
  Complex = 'complex', // Business logic + UI (Form, DataTable)
  Page = 'page', // Full page components
}

// Enhanced component interface metadata for standardization
export interface ComponentStandard {
  // Basic component info
  name: string;
  category: ComponentCategory;
  complexity: ComponentComplexity;
  description: string;

  // Expected props structure
  expectedProps: string[];
  requiredProps: string[];

  // Enhanced component patterns
  shouldUseChildren: boolean;
  shouldUseRenderProps: boolean;
  shouldUseHooks: boolean;
  shouldUseContext: boolean;

  // React-specific metadata
  displayName?: string;
  defaultProps?: Record<string, unknown>;
  propTypes?: Record<string, unknown>;

  // Component architecture
  shouldBeSplitIntoSmaller: boolean;
  recommendedRefactoring?: string;

  // Performance considerations
  shouldBeMemoized: boolean;
  hasPotentialPerformanceIssues: boolean;

  // Accessibility
  hasA11yIssues: boolean;
  a11yRecommendations?: string[];

  // Design system alignment
  conformsToDesignSystem: boolean;
  designDeviations?: string[];

  // Code quality
  hasTests: boolean;
  testCoverage?: number;
  complexityScore?: number;

  // Documentation
  hasDocumentation: boolean;
  documentationUrl?: string;

  hasProps: boolean;
  hasPropTypes: boolean;
  hasI18n: boolean;
  hasStorybook: boolean;
  hasStyles: boolean;
  hasErrorBoundary: boolean;
  hasMemoization: boolean;
}

// Improved prop types for standardization
export type StandardProps<T = unknown> = {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
} & T;

// Define audit result types
export type ComponentAuditResult = {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
};

export const COMPONENT_AUDIT_RESULTS: Record<string, ComponentAuditResult> = {
  MISSING_DISPLAY_NAME: {
    passed: false,
    message: 'Component is missing displayName property',
    severity: 'warning',
  },
  MISSING_PROP_TYPES: {
    passed: false,
    message: 'Component is missing PropTypes validation',
    severity: 'warning',
  },
  // ... add other audit results as needed
} as const;

// Component standards checking
export function checkComponentStandards(
  componentName: string,
  componentProps: string[],
  componentImplementation: string,
): Partial<ComponentStandard> {
  const defaultAudit = {
    name: componentName,
    hasA11yIssues: true,
    hasPotentialPerformanceIssues: true,
    conformsToDesignSystem: false,
    hasTests: false,
    complexityScore: 5,
  };

  return COMPONENT_AUDIT_RESULTS[componentName]
    ? { ...defaultAudit, ...COMPONENT_AUDIT_RESULTS[componentName] }
    : defaultAudit;
}

// Guidelines for standardization
export {};

// Component refactoring suggestions
export function generateRefactoringSuggestions(componentName: string): string[] {
  const auditResult = COMPONENT_AUDIT_RESULTS[componentName];

  if (!auditResult) {
    return ['Unknown component, perform a manual audit first'];
  }

  const suggestions: string[] = [];

  if (auditResult.shouldBeSplitIntoSmaller) {
    suggestions.push(`Split into smaller components: ${auditResult.recommendedRefactoring}`);
  }

  if (auditResult.hasPotentialPerformanceIssues) {
    suggestions.push('Review for performance optimizations, consider memoization');
  }

  if (auditResult.hasA11yIssues && auditResult.a11yRecommendations) {
    suggestions.push(`Fix accessibility issues: ${auditResult.a11yRecommendations.join(', ')}`);
  }

  if (!auditResult.conformsToDesignSystem) {
    suggestions.push('Align with design system standards');
  }

  if (!auditResult.hasTests) {
    suggestions.push('Add unit and integration tests');
  }

  if (!auditResult.hasDocumentation) {
    suggestions.push('Add component documentation');
  }

  return suggestions;
}

// Enhanced component template generation
export function generateStandardComponent<P extends StandardProps>(
  name: string,
  props: Array<keyof P> = [],
): string {
  const propsInterface = `interface ${name}Props extends StandardProps {
    ${props.map((prop) => `${String(prop)}: string;`).join('\n    ')}
  }`;

  return `import React from 'react';
import { StandardProps } from '../utils/component-standards';

${propsInterface}

/**
 * ${name} component
 * 
 * @param props - Component props
 * @returns ${name} component
 */
export const ${name} = React.memo(function ${name}({ 
  children,
  className,
  style,
  ${props.join(', ')},
  ...rest
}: ${name}Props) {
  return (
    <div 
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
});

${name}.displayName = '${name}';
`;
}

// Enhanced prop standardization with type safety
export function standardizeProps<T extends Record<string, unknown>>(
  oldProps: T,
): Record<string, unknown> {
  const standardPropMappings: Record<string, string> = {
    // Common props standardization
    isDisabled: 'disabled',
    disabled: 'disabled',
    isActive: 'active',
    active: 'active',
    isOpen: 'open',
    opened: 'open',
    isVisible: 'visible',
    visible: 'visible',
    isSelected: 'selected',
    selected: 'selected',

    // Event handlers
    onPress: 'onClick',
    onTap: 'onClick',
    onSelect: 'onChange',
    onActivate: 'onChange',

    // Style-related props
    customClass: 'className',
    style: 'style',
    customStyle: 'style',

    // Size-related props
    size: 'size',
    sizeVariant: 'size',
    textSize: 'size',

    // Type/variant-related props
    type: 'variant',
    buttonType: 'variant',
    cardType: 'variant',
    variant: 'variant',
  };

  return Object.entries(oldProps).reduce(
    (acc, [key, value]) => {
      const standardKey = standardPropMappings[key] || key;
      acc[standardKey] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

// Type-safe component wrapper with proper return type
export function withStandardization<P extends StandardProps>(
  WrappedComponent: ComponentType<P>,
  options: Partial<ComponentStandard> = {},
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<unknown>> {
  const StandardizedComponent = React.forwardRef<unknown, P>((props, ref) => {
    const standardizedProps = standardizeProps(props);

    return <WrappedComponent {...(standardizedProps as P)} ref={ref} />;
  });

  StandardizedComponent.displayName = `Standardized(${
    options.displayName || WrappedComponent.displayName || WrappedComponent.name
  })`;

  return StandardizedComponent;
}

// Component audit functions
export function auditComponentDirectory(
  directoryPath: string,
): Record<string, Partial<ComponentStandard>> {
  const results: Record<string, Partial<ComponentStandard>> = {};

  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      if (file.match(/\.(tsx|jsx)$/)) {
        const filePath = path.join(directoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        results[file] = auditComponent(content, filePath);
      }
    }

    return results;
  } catch (error) {
    console.error(`Error auditing directory ${directoryPath}:`, error);
    return {};
  }
}

function determineComponentCategory(content: string): ComponentCategory {
  if (content.includes('layout') || content.includes('Layout')) return ComponentCategory.Layout;
  if (content.includes('form') || content.includes('Form')) return ComponentCategory.Form;
  if (content.includes('nav') || content.includes('Nav')) return ComponentCategory.Navigation;
  if (content.includes('display') || content.includes('Display')) return ComponentCategory.Display;
  if (content.includes('feedback') || content.includes('Feedback'))
    return ComponentCategory.Feedback;
  if (content.includes('ar') || content.includes('AR')) return ComponentCategory.AR;
  if (content.includes('media') || content.includes('Media')) return ComponentCategory.Media;
  if (content.includes('chart') || content.includes('Chart')) return ComponentCategory.Chart;
  return ComponentCategory.Utility;
}

function calculateComplexity(content: string): ComponentComplexity {
  const lines = content.split('\n').length;
  const hooks = (content.match(/use[A-Z]/g) || []).length;
  const jsx = (content.match(/<[A-Z][^>]*>/g) || []).length;

  if (lines > 300 || hooks > 5 || jsx > 20) return ComponentComplexity.Complex;
  if (lines > 150 || hooks > 3 || jsx > 10) return ComponentComplexity.Compound;
  if (content.includes('Page') || content.includes('Screen')) return ComponentComplexity.Page;
  return ComponentComplexity.Simple;
}

function extractComponentDescription(content: string): string {
  const match = content.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\//);
  return match ? match[0].replace(/[/*]/g, '').trim() : '';
}

function extractExpectedProps(content: string): string[] {
  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/);
  if (!propsMatch) return [];
  return propsMatch[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(':')[0]);
}

function extractRequiredProps(content: string): string[] {
  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/);
  if (!propsMatch) return [];
  return propsMatch[1]
    .split('\n')
    .filter((line) => !line.includes('?:'))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(':')[0]);
}

function checkChildrenUsage(content: string): boolean {
  return content.includes('children') || content.includes('ReactNode');
}

function checkRenderPropsUsage(content: string): boolean {
  return content.includes('render:') || content.includes('children: (');
}

function checkHooksUsage(content: string): boolean {
  return content.includes('useState') || content.includes('useEffect');
}

function checkContextUsage(content: string): boolean {
  return content.includes('useContext') || content.includes('createContext');
}

function extractDisplayName(content: string): string {
  const match = content.match(/displayName\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*['"]([^'"]*)['"]/);
  return match ? match[1] : '';
}

function extractDefaultProps(content: string): Record<string, unknown> {
  const match = content.match(/defaultProps\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*({[^}]*})/);
  if (!match) return {};
  try {
    return JSON.parse(match[1].replace(/'/g, '"'));
  } catch {
    return {};
  }
}

function checkComponentSize(content: string): boolean {
  const lines = content.split('\n').length;
  return lines > 200;
}

function checkMemoizationNeeded(content: string): boolean {
  const reRenderRisk = content.includes('map(') || content.includes('filter(');
  const hasProps = content.includes('Props');
  return reRenderRisk && hasProps;
}

function checkPerformanceIssues(content: string): boolean {
  return (
    content.includes('useState') &&
    content.includes('useEffect') &&
    !content.includes('useMemo') &&
    !content.includes('useCallback')
  );
}

function checkAccessibilityIssues(content: string): boolean {
  return !content.includes('aria-') && !content.includes('role=') && content.includes('onClick');
}

function checkDesignSystemCompliance(content: string): boolean {
  // This would need to be customized based on your design system
  return content.includes('theme') || content.includes('styled');
}

function checkTestCoverage(filePath: string): boolean {
  const testPath = filePath.replace(/\.(tsx|jsx)$/, '.test.$1');
  return fs.existsSync(testPath);
}

function calculateTestCoverage(filePath: string): number {
  // This would need integration with your test coverage tool
  return 0;
}

function calculateComplexityScore(content: string): number {
  let score = 0;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/if\s*\(/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/\?\s*/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/&&\s*/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/\|\|\s*/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/switch\s*\(/g) || []).length * 2;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/for\s*\(/g) || []).length * 2;
  return score;
}

function checkDocumentation(content: string): boolean {
  return content.includes('/**') && content.includes('*/');
}

function checkI18nImplementation(content: string): boolean {
  return content.includes('useTranslation') || content.includes('t(');
}

function checkStorybookExists(filePath: string): boolean {
  const storyPath = filePath.replace(/\.(tsx|jsx)$/, '.stories.$1');
  return fs.existsSync(storyPath);
}

function checkStyleImplementation(content: string): boolean {
  return (
    content.includes('styled') ||
    content.includes('makeStyles') ||
    content.includes('.module.css') ||
    content.includes('.module.scss')
  );
}

function checkErrorBoundaryImplementation(content: string): boolean {
  return content.includes('componentDidCatch') || content.includes('ErrorBoundary');
}

function checkMemoizationImplementation(content: string): boolean {
  return (
    content.includes('React.memo') || content.includes('useMemo') || content.includes('useCallback')
  );
}

export function generateAuditReport(results: Record<string, Partial<ComponentStandard>>): string {
  let report = '# Component Standards Audit Report\n\n';

  for (const [file, standard] of Object.entries(results)) {
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `## ${file}\n\n`;

    for (const [key, value] of Object.entries(standard)) {
      const status = value ? '✅' : '❌';
      if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- ${status} ${key}\n`;
    }

    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '\n';
  }

  return report;
}

// Priority recommendations for standardization
export function getPriorityStandardizationTasks(): { component: string; reason: string }[] {
  return [
    {
      component: 'ThreeARViewer',
      reason: 'High complexity score, performance issues, and no tests',
    },
    {
      component: 'ProductDetailPage',
      reason: 'No consistent prop naming, overly complex, poor performance',
    },
    {
      component: 'Navigation',
      reason: 'Accessibility issues, not aligned with design system',
    },
    {
      component: 'Form',
      reason: 'Inconsistent event handling, needs refactoring into smaller components',
    },
    {
      component: 'UserProfile',
      reason: 'Mixed styling approaches, needs alignment with design tokens',
    },
  ];
}
