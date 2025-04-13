/**
 * Component Standardization Utilities
 * Provides tools for component auditing, guidelines, and refactoring
 */

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
  Utility = 'utility'
}

// Component complexity levels
export enum ComponentComplexity {
  Simple = 'simple',     // Basic UI elements (Button, Text, Icon)
  Compound = 'compound', // Multiple simple components composed (Card, Form Field)
  Complex = 'complex',   // Business logic + UI (Form, DataTable)
  Page = 'page'          // Full page components
}

// Component interface metadata for standardization
export interface ComponentStandard {
  // Basic component info
  name: string;
  category: ComponentCategory;
  complexity: ComponentComplexity;
  description: string;
  
  // Expected props structure
  expectedProps: string[];
  requiredProps: string[];
  
  // Component patterns
  shouldUseChildren: boolean;
  shouldUseRenderProps: boolean;
  shouldUseHooks: boolean;
  shouldUseContext: boolean;
  
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

// Sample component audit results
export const COMPONENT_AUDIT_RESULTS: Record<string, Partial<ComponentStandard>> = {
  'Button': {
    name: 'Button',
    category: ComponentCategory.Form,
    complexity: ComponentComplexity.Simple,
    description: 'Standard button component with multiple variants',
    expectedProps: ['variant', 'size', 'disabled', 'onClick', 'children', 'className'],
    requiredProps: ['children'],
    shouldUseChildren: true,
    shouldUseRenderProps: false,
    shouldUseHooks: false,
    shouldUseContext: false,
    shouldBeSplitIntoSmaller: false,
    shouldBeMemoized: false,
    hasPotentialPerformanceIssues: false,
    hasA11yIssues: false,
    conformsToDesignSystem: true,
    hasTests: true,
    testCoverage: 85,
    complexityScore: 2,
    hasDocumentation: true
  },
  
  'Card': {
    name: 'Card',
    category: ComponentCategory.Display,
    complexity: ComponentComplexity.Compound,
    description: 'Container component for displaying grouped content',
    expectedProps: ['title', 'children', 'footer', 'className'],
    requiredProps: ['children'],
    shouldUseChildren: true,
    shouldUseRenderProps: false,
    shouldUseHooks: false,
    shouldUseContext: false,
    shouldBeSplitIntoSmaller: false,
    shouldBeMemoized: false,
    hasPotentialPerformanceIssues: false,
    hasA11yIssues: false,
    conformsToDesignSystem: true,
    hasTests: true,
    testCoverage: 70,
    complexityScore: 3,
    hasDocumentation: true
  },
  
  'ThreeARViewer': {
    name: 'ThreeARViewer',
    category: ComponentCategory.AR,
    complexity: ComponentComplexity.Complex,
    description: 'Displays 3D models using Three.js',
    expectedProps: ['modelUrl', 'width', 'height', 'autoRotate', 'controls'],
    requiredProps: ['modelUrl'],
    shouldUseChildren: false,
    shouldUseRenderProps: false,
    shouldUseHooks: true,
    shouldUseContext: false,
    shouldBeSplitIntoSmaller: true,
    recommendedRefactoring: 'Split into ModelLoader, SceneRenderer, and Controls components',
    shouldBeMemoized: true,
    hasPotentialPerformanceIssues: true,
    hasA11yIssues: true,
    a11yRecommendations: ['Add appropriate ARIA labels', 'Ensure keyboard navigation'],
    conformsToDesignSystem: false,
    designDeviations: ['Custom styling not aligned with design tokens'],
    hasTests: false,
    complexityScore: 8,
    hasDocumentation: false
  }
};

// Component standards checking
export function checkComponentStandards(componentName: string, componentProps: string[], componentImplementation: string): Partial<ComponentStandard> {
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
    boolean: 'Use positive boolean names without "is" prefix where possible (e.g., disabled instead of isDisabled)',
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
  }
};

// Component refactoring suggestions
export function generateRefactoringSuggestions(componentName: string): string[] {
  const auditResult = COMPONENT_AUDIT_RESULTS[componentName];
  
  if (!auditResult) {
    return [
      'Unknown component, perform a manual audit first'
    ];
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

// Generate standard component template
export function generateStandardComponent(name: string, props: string[] = []): string {
  const propsInterface = `interface ${name}Props {
  ${props.map(prop => `${prop}: any;`).join('\n  ')}
  className?: string;
}`;

  return `import React from 'react';
import styles from './${name}.module.css';

${propsInterface}

/**
 * ${name} component
 * 
 * @param props - Component props
 * @returns ${name} component
 */
export function ${name}({ ${props.join(', ')}, className }: ${name}Props) {
  return (
    <div className={\`\${styles.container} \${className || ''}\`}>
      {/* Component implementation */}
    </div>
  );
}
`;
}

// Standardize prop names across components
export function standardizeProps(oldProps: Record<string, any>): Record<string, any> {
  const standardPropMappings: Record<string, string> = {
    // Common props standardization
    'isDisabled': 'disabled',
    'disabled': 'disabled',
    'isActive': 'active',
    'active': 'active',
    'isOpen': 'open',
    'opened': 'open',
    'isVisible': 'visible',
    'visible': 'visible',
    'isSelected': 'selected',
    'selected': 'selected',
    
    // Event handlers
    'onPress': 'onClick',
    'onTap': 'onClick',
    'onSelect': 'onChange',
    'onActivate': 'onChange',
    
    // Style-related props
    'customClass': 'className',
    'style': 'style',
    'customStyle': 'style',
    
    // Size-related props
    'size': 'size',
    'sizeVariant': 'size',
    'textSize': 'size',
    
    // Type/variant-related props
    'type': 'variant',
    'buttonType': 'variant',
    'cardType': 'variant',
    'variant': 'variant',
  };
  
  const standardizedProps: Record<string, any> = {};
  
  // Convert props to standard names
  for (const [key, value] of Object.entries(oldProps)) {
    const standardKey = standardPropMappings[key] || key;
    standardizedProps[standardKey] = value;
  }
  
  return standardizedProps;
}

// Component audit functions
export function auditComponentDirectory(directoryPath: string): Record<string, Partial<ComponentStandard>> {
  // In a real implementation, this would:
  // 1. Scan the directory for component files
  // 2. Parse and analyze each component
  // 3. Return audit results for each component
  
  return COMPONENT_AUDIT_RESULTS;
}

// Priority recommendations for standardization
export function getPriorityStandardizationTasks(): { component: string, reason: string }[] {
  return [
    { 
      component: 'ThreeARViewer', 
      reason: 'High complexity score, performance issues, and no tests' 
    },
    { 
      component: 'ProductDetailPage', 
      reason: 'No consistent prop naming, overly complex, poor performance'
    },
    { 
      component: 'Navigation', 
      reason: 'Accessibility issues, not aligned with design system'
    },
    { 
      component: 'Form', 
      reason: 'Inconsistent event handling, needs refactoring into smaller components'
    },
    { 
      component: 'UserProfile', 
      reason: 'Mixed styling approaches, needs alignment with design tokens'
    }
  ];
} 