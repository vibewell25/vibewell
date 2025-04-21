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

export const COMPONENT_AUDIT_RESULTS = {
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
  componentImplementation: string
): Partial<ComponentStandard> {
  // This would be a real implementation that analyzes the component
  // For now, we return mock data based on the component name
  const auditResult = COMPONENT_AUDIT_RESULTS[componentName] || {
    name: componentName,
    hasA11yIssues: true,
    hasPotentialPerformanceIssues: true,
    conformsToDesignSystem: false,
    hasTests: false,
    complexityScore: 5,
  };

  return auditResult;
}

// Guidelines for standardization
export const COMPONENT_GUIDELINES = {
  naming: {
    components: 'Use PascalCase for component names (e.g., Button, UserProfile)',
    props: 'Use camelCase for prop names (e.g., onClick, isDisabled)',
    events: 'Prefix event handlers with "on" (e.g., onClick, onSubmit)',
    boolean:
      'Use positive boolean names without "is" prefix where possible (e.g., disabled instead of isDisabled)',
  },

  structure: {
    singleResponsibility: 'Each component should have a single responsibility',
    composition: 'Prefer composition over inheritance',
    propsInterface: 'Define a typed interface for component props',
    defaultProps: 'Provide sensible default props where appropriate',
    propTypes: 'Use TypeScript for prop type checking',
  },

  patterns: {
    hooks: 'Prefer functional components with hooks over class components',
    context: 'Use context for deeply shared state, props for everything else',
    hoc: 'Avoid Higher Order Components when hooks can be used instead',
    renderProps: 'Limit use of render props to specific use cases only',
    memoization: 'Use React.memo() for pure functional components that render often',
  },

  accessibility: {
    semantics: 'Use appropriate semantic HTML elements',
    aria: 'Include ARIA attributes when needed',
    keyboard: 'Ensure keyboard navigation works for all interactive elements',
    focus: 'Maintain clear focus states and management',
    images: 'Always include alt text for images',
  },

  styling: {
    cssModules: 'Use CSS Modules or styled-components for component styling',
    designTokens: 'Use design tokens for colors, spacing, typography instead of hard-coded values',
    responsiveness: 'Ensure components work across all supported viewport sizes',
    darkMode: 'Support light and dark mode where applicable',
  },

  testing: {
    coverage: 'Aim for 80% test coverage for critical components',
    userEvents: 'Test both mouse and keyboard interactions',
    accessibility: 'Include accessibility tests',
    snapshots: 'Use snapshot tests sparingly and intentionally',
  },
};

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
  props: Array<keyof P> = []
): string {
  const propsInterface = `interface ${name}Props extends StandardProps {
    ${props.map(prop => `${String(prop)}: string;`).join('\n    ')}
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
  oldProps: T
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
    {} as Record<string, unknown>
  );
}

// Type-safe component wrapper with proper return type
export function withStandardization<P extends StandardProps>(
  WrappedComponent: ComponentType<P>,
  options: Partial<ComponentStandard> = {}
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
  directoryPath: string
): Record<string, Partial<ComponentStandard>> {
  throw new Error('Not implemented');
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
