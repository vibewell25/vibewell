import fs from 'fs';
import path from 'path';

import { ComponentCategory, ComponentComplexity, ComponentStandard } from './component-standards';

export function auditComponent(content: string, filePath: string): Partial<ComponentStandard> {
  return {
    name: path.basename(filePath).replace(/\.(tsx|jsx)$/, ''),
    category: determineComponentCategory(content),
    complexity: calculateComplexity(content),
    description: extractComponentDescription(content),
    expectedProps: extractExpectedProps(content),
    requiredProps: extractRequiredProps(content),
    shouldUseChildren: checkChildrenUsage(content),
    shouldUseRenderProps: checkRenderPropsUsage(content),
    shouldUseHooks: checkHooksUsage(content),
    shouldUseContext: checkContextUsage(content),
    displayName: extractDisplayName(content),
    defaultProps: extractDefaultProps(content),
    shouldBeSplitIntoSmaller: checkComponentSize(content),
    shouldBeMemoized: checkMemoizationNeeded(content),
    hasPotentialPerformanceIssues: checkPerformanceIssues(content),
    hasA11yIssues: checkAccessibilityIssues(content),
    conformsToDesignSystem: checkDesignSystemCompliance(content),
    hasTests: checkTestCoverage(filePath),
    testCoverage: calculateTestCoverage(filePath),
    complexityScore: calculateComplexityScore(content),
    hasDocumentation: checkDocumentation(content),
    hasI18n: checkI18nImplementation(content),
    hasStorybook: checkStorybookExists(filePath),
    hasStyles: checkStyleImplementation(content),
    hasErrorBoundary: checkErrorBoundaryImplementation(content),
    hasMemoization: checkMemoizationImplementation(content),
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
function calculateComplexity(content: string): ComponentComplexity {
  const lines = content.split('\n').length;

  const hooks = (content.match(/use[A-Z]/g) || []).length;

  const jsx = (content.match(/<[A-Z][^>]*>/g) || []).length;

  if (lines > 300 || hooks > 5 || jsx > 20) return ComponentComplexity.Complex;
  if (lines > 150 || hooks > 3 || jsx > 10) return ComponentComplexity.Compound;
  if (content.includes('Page') || content.includes('Screen')) return ComponentComplexity.Page;
  return ComponentComplexity.Simple;
// Helper functions for component analysis
function extractComponentDescription(content: string): string {
  const match = content.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\//);
  return match ? match[0].replace(/[/*]/g, '').trim() : '';
function extractExpectedProps(content: string): string[] {

  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/);
  if (!propsMatch) return [];
  return propsMatch[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(':')[0]);
function extractRequiredProps(content: string): string[] {

  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/);
  if (!propsMatch) return [];
  return propsMatch[1]
    .split('\n')
    .filter((line) => !line.includes('?:'))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(':')[0]);
function checkChildrenUsage(content: string): boolean {
  return content.includes('children') || content.includes('ReactNode');
function checkRenderPropsUsage(content: string): boolean {
  return content.includes('render:') || content.includes('children: (');
function checkHooksUsage(content: string): boolean {
  return content.includes('useState') || content.includes('useEffect');
function checkContextUsage(content: string): boolean {
  return content.includes('useContext') || content.includes('createContext');
function extractDisplayName(content: string): string {
  const match = content.match(/displayName\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*['"]([^'"]*)['"]/);
  return match ? match[1] : '';
function extractDefaultProps(content: string): Record<string, unknown> {
  const match = content.match(/defaultProps\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*({[^}]*})/);
  if (!match) return {};
  try {
    return JSON.parse(match[1].replace(/'/g, '"'));
catch {
    return {};
function checkComponentSize(content: string): boolean {
  return content.split('\n').length > 200;
function checkMemoizationNeeded(content: string): boolean {
  const reRenderRisk = content.includes('map(') || content.includes('filter(');
  const hasProps = content.includes('Props');
  return reRenderRisk && hasProps;
function checkPerformanceIssues(content: string): boolean {
  return (
    content.includes('useState') &&
    content.includes('useEffect') &&
    !content.includes('useMemo') &&
    !content.includes('useCallback')
function checkAccessibilityIssues(content: string): boolean {
  return !content.includes('aria-') && !content.includes('role=') && content.includes('onClick');
function checkDesignSystemCompliance(content: string): boolean {
  return content.includes('theme') || content.includes('styled');
function checkTestCoverage(filePath: string): boolean {
  const testPath = filePath.replace(/\.(tsx|jsx)$/, '.test.$1');
  return fs.existsSync(testPath);
function calculateTestCoverage(filePath: string): number {
  // This would need integration with your test coverage tool
  return 0;
function calculateComplexityScore(content: string): number {
  let score = 0;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/if\s*\(/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/\?\s*/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/&&\s*/g) || []).length;
  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/\|\|\s*/g) || []).length;

  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/switch\s*\(/g) || []).length * 2;

  if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (content.match(/for\s*\(/g) || []).length * 2;
  return score;
function checkDocumentation(content: string): boolean {
  return content.includes('/**') && content.includes('*/');
function checkI18nImplementation(content: string): boolean {
  return content.includes('useTranslation') || content.includes('t(');
function checkStorybookExists(filePath: string): boolean {
  const storyPath = filePath.replace(/\.(tsx|jsx)$/, '.stories.$1');
  return fs.existsSync(storyPath);
function checkStyleImplementation(content: string): boolean {
  return (
    content.includes('styled') ||
    content.includes('makeStyles') ||
    content.includes('.module.css') ||
    content.includes('.module.scss')
function checkErrorBoundaryImplementation(content: string): boolean {
  return content.includes('componentDidCatch') || content.includes('ErrorBoundary');
function checkMemoizationImplementation(content: string): boolean {
  return (
    content.includes('React.memo') || content.includes('useMemo') || content.includes('useCallback')
