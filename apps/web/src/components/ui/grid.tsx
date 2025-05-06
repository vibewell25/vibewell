import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fill' | 'auto-fit';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  flow?: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  className?: string;
  minWidth?: string;
/**
 * Grid - A flexible Grid layout component
 *
 * This component provides a simple way to create grid layouts with configurable
 * columns, gaps, alignment, and other grid properties.
 */
export function Grid({
  children,
  columns = 12,
  gap = 'md',
  rowGap,
  columnGap,
  align,
  justify,
  flow,
  className,
  minWidth,
  ...props
: GridProps) {
  // Map column counts to Tailwind classes
  const columnsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
    'auto-fill': 'grid-cols-auto-fill',
    'auto-fit': 'grid-cols-auto-fit',
// Map gap sizes to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
// Map row gap sizes to Tailwind classes
  const rowGapClasses = {
    none: 'row-gap-0',
    xs: 'row-gap-1',
    sm: 'row-gap-2',
    md: 'row-gap-4',
    lg: 'row-gap-6',
    xl: 'row-gap-8',
// Map column gap sizes to Tailwind classes
  const columnGapClasses = {
    none: 'col-gap-0',
    xs: 'col-gap-1',
    sm: 'col-gap-2',
    md: 'col-gap-4',
    lg: 'col-gap-6',
    xl: 'col-gap-8',
// Map alignment to Tailwind classes
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
// Map justification to Tailwind classes
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
// Map flow to Tailwind classes
  const flowClasses = {
    row: 'grid-flow-row',
    column: 'grid-flow-col',
    dense: 'grid-flow-dense',
    'row-dense': 'grid-flow-row-dense',
    'column-dense': 'grid-flow-col-dense',
// Generate auto-fill or auto-fit grid style if needed
  let gridAutoStyle = {};
  if (columns === 'auto-fill' || columns === 'auto-fit') {
    gridAutoStyle = {
      gridTemplateColumns: `repeat(${columns}, minmax(${minWidth || '250px'}, 1fr))`,
// Combine classes
  const gridClasses = cn(
    'grid',
    typeof columns === 'number' || typeof columns === 'string' ? columnsClasses[columns] : null,
    gap !== 'none' && !rowGap && !columnGap ? gapClasses[gap] : null,
    rowGap ? rowGapClasses[rowGap] : null,
    columnGap ? columnGapClasses[columnGap] : null,
    align ? alignClasses[align] : null,
    justify ? justifyClasses[justify] : null,
    flow ? flowClasses[flow] : null,
    className,
return (
    <div className={gridClasses} style={gridAutoStyle} {...props}>
      {children}
    </div>
interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
  end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  className?: string;
/**
 * GridItem - Individual grid item component
 */
export function GridItem({ children, span, start, end, className, ...props }: GridItemProps) {
  // Map span values to Tailwind classes
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
    full: 'col-span-full',
// Map start values to Tailwind classes
  const startClasses = {
    1: 'col-start-1',
    2: 'col-start-2',
    3: 'col-start-3',
    4: 'col-start-4',
    5: 'col-start-5',
    6: 'col-start-6',
    7: 'col-start-7',
    8: 'col-start-8',
    9: 'col-start-9',
    10: 'col-start-10',
    11: 'col-start-11',
    12: 'col-start-12',
    auto: 'col-start-auto',
// Map end values to Tailwind classes
  const endClasses = {
    1: 'col-end-1',
    2: 'col-end-2',
    3: 'col-end-3',
    4: 'col-end-4',
    5: 'col-end-5',
    6: 'col-end-6',
    7: 'col-end-7',
    8: 'col-end-8',
    9: 'col-end-9',
    10: 'col-end-10',
    11: 'col-end-11',
    12: 'col-end-12',
    13: 'col-end-13',
    auto: 'col-end-auto',
// Combine classes
  const itemClasses = cn(
    span ? spanClasses[span] : null,
    start ? startClasses[start] : null,
    end ? endClasses[end] : null,
    className,
return (
    <div className={itemClasses} {...props}>
      {children}
    </div>
