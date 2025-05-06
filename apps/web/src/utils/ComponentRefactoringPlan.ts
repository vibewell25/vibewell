import { ComponentCategory, ComponentComplexity } from './component-standards';

/**
 * Component audit item structure
 */
export interface ComponentAuditItem {
  name: string;
  path: string;
  category: ComponentCategory;
  complexity: ComponentComplexity;
  issues: ComponentIssue[];
  refactoringPriority: 'high' | 'medium' | 'low';
/**
 * Types of component issues that require refactoring
 */
export enum ComponentIssueType {
  TOO_COMPLEX = 'too_complex',
  PROP_DRILLING = 'prop_drilling',
  MIXED_CONCERNS = 'mixed_concerns',
  STYLING_INCONSISTENCY = 'styling_inconsistency',
  ACCESSIBILITY_ISSUE = 'accessibility_issue',
  PERFORMANCE_ISSUE = 'performance_issue',
  DUPLICATE_LOGIC = 'duplicate_logic',
  HARD_CODED_VALUES = 'hard_coded_values',
  POOR_COMPOSITION = 'poor_composition',
  TEST_COVERAGE = 'test_coverage',
/**
 * Component issue structure
 */
export interface ComponentIssue {
  type: ComponentIssueType;
  description: string;
  refactoringApproach: string;
/**
 * Component refactoring strategy
 */
export enum RefactoringStrategy {
  COMPONENT_SPLITTING = 'component_splitting',
  CUSTOM_HOOKS = 'custom_hooks',
  CONTEXT_API = 'context_api',
  COMPOUND_COMPONENTS = 'compound_components',
  RENDER_PROPS = 'render_props',
  HIGHER_ORDER_COMPONENTS = 'higher_order_components',
  COMPOSITION_OVER_PROPS = 'composition_over_props',
/**
 * Component refactoring phases
 */
export {};

/**
 * Best practices for component composition
 */
export {};

/**
 * Refactoring plan implementation steps
 */
export {};

/**
 * Tool functions to help with refactoring
 */
export {};

/**
 * Component Refactoring Implementation Roadmap
 */
export {};
