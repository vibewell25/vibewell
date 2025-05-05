import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * If true, the content will be visually hidden but announced to screen readers.
   * If false, the content will be visible (useful for conditional hiding).
   */
  hidden?: boolean;
  children: React.ReactNode;
  as?: 'span' | 'div' | 'p';
/**
 * VisuallyHidden component renders content that is invisible to sighted users
 * but still accessible to screen readers - a common accessibility pattern.
 *
 * Use this component to provide additional context to screen reader users
 * without affecting the visual design.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ hidden = true, children, className, as: Component = 'span', ...props }, ref) => {
    const visuallyHiddenClassName = 'sr-only';

    // If not hidden, render the content visually
    if (!hidden) {
      return (
        <Component ref={ref as any} className={className} {...props}>
          {children}
        </Component>
return (
      <Component ref={ref as any} className={cn(visuallyHiddenClassName, className)} {...props}>
        {children}
      </Component>
VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;

/**
 * Utility components for common visually hidden patterns
 */

export function ScreenReaderOnly({ children, ...props }: Omit<VisuallyHiddenProps, 'hidden'>) {
  return <VisuallyHidden {...props}>{children}</VisuallyHidden>;
export function ScreenReaderText({
  text,
  ...props
: Omit<VisuallyHiddenProps, 'hidden' | 'children'> & { text: string }) {
  return <VisuallyHidden {...props}>{text}</VisuallyHidden>;
export function IconLabel({
  icon,
  label,
  ...props
: { icon: React.ReactNode; label: string } & Omit<VisuallyHiddenProps, 'hidden' | 'children'>) {
  return (
    <>
      {icon}
      <VisuallyHidden {...props}>{label}</VisuallyHidden>
    </>
export function A11yButton({
  children,
  a11yLabel,
  ...props
: React.ButtonHTMLAttributes<HTMLButtonElement> & { a11yLabel: string }) {
  return (
    <button {...props}>
      {children}
      <VisuallyHidden>{a11yLabel}</VisuallyHidden>
    </button>
/**
 * Use this when a heading is needed for screen readers but should be visually styled differently
 */
export function A11yHeading({
  visualLevel,
  a11yLevel = 2,
  children,
  className,
  ...props
: React.HTMLAttributes<HTMLHeadingElement> & {
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  a11yLevel: 1 | 2 | 3 | 4 | 5 | 6;
) {
  const A11yHeadingTag = `h${a11yLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // Apply styles based on visual heading level if specified
  let headingStyles = '';
  if (visualLevel) {
    switch (visualLevel) {
      case 1:
        headingStyles = 'text-4xl font-bold';
        break;
      case 2:
        headingStyles = 'text-3xl font-bold';
        break;
      case 3:
        headingStyles = 'text-2xl font-semibold';
        break;
      case 4:
        headingStyles = 'text-xl font-semibold';
        break;
      case 5:
        headingStyles = 'text-lg font-medium';
        break;
      case 6:
        headingStyles = 'text-base font-medium';
        break;
      default:
        headingStyles = '';
return (
    <A11yHeadingTag className={cn(headingStyles, className)} {...props}>
      {children}
    </A11yHeadingTag>
