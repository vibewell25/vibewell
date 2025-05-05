import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'screen';
  padding?: boolean | 'x' | 'y' | 'none';
  centerContent?: boolean;
  stretchHeight?: boolean;
/**
 * ResponsiveContainer - A container component that adapts to different screen sizes
 *
 * This component provides a consistent container with appropriate padding,
 * max-width, and other responsive behaviors based on the current screen size.
 */
export function ResponsiveContainer({
  children,
  className,
  as: Component = 'div',
  maxWidth = 'lg',
  padding = true,
  centerContent = false,
  stretchHeight = false,
: ResponsiveContainerProps) {
  const { deviceType } = useResponsive();

  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    screen: 'max-w-screen',
// Determine padding based on device type and padding prop
  let paddingClasses = '';

  if (padding === true) {
    // Responsive padding based on device type
    switch (deviceType) {
      case 'mobile':
        paddingClasses = 'px-4 py-4';
        break;
      case 'tablet':
        paddingClasses = 'px-6 py-6';
        break;
      case 'desktop':
        paddingClasses = 'px-8 py-8';
        break;
      default:
        paddingClasses = 'px-4 py-4';
else if (padding === 'x') {
    switch (deviceType) {
      case 'mobile':
        paddingClasses = 'px-4';
        break;
      case 'tablet':
        paddingClasses = 'px-6';
        break;
      case 'desktop':
        paddingClasses = 'px-8';
        break;
      default:
        paddingClasses = 'px-4';
else if (padding === 'y') {
    switch (deviceType) {
      case 'mobile':
        paddingClasses = 'py-4';
        break;
      case 'tablet':
        paddingClasses = 'py-6';
        break;
      case 'desktop':
        paddingClasses = 'py-8';
        break;
      default:
        paddingClasses = 'py-4';
// Combine all classes
  const containerClasses = cn(
    'mx-auto w-full',
    maxWidthClasses[maxWidth],
    paddingClasses,
    centerContent && 'flex flex-col items-center',
    stretchHeight && 'h-full',
    className,
return <Component className={containerClasses}>{children}</Component>;
