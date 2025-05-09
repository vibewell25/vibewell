import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const listVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      bordered: 'rounded-md border',
      separated: 'divide-y',
      card: 'rounded-md border shadow-sm',
size: {
      default: '',
      sm: '',
      lg: '',
compoundVariants: [
    {
      variant: 'bordered',
      size: 'sm',
      className: 'text-sm',
{
      variant: 'bordered',
      size: 'lg',
      className: 'text-lg',
{
      variant: 'separated',
      size: 'sm',
      className: 'text-sm',
{
      variant: 'separated',
      size: 'lg',
      className: 'text-lg',
{
      variant: 'card',
      size: 'sm',
      className: 'text-sm',
{
      variant: 'card',
      size: 'lg',
      className: 'text-lg',
],
  defaultVariants: {
    variant: 'default',
    size: 'default',
interface ListProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {
  className?: string;
/**
 * List - A component for displaying lists of content
 *
 * This component provides various list styles for displaying
 * collections of items.
 */
const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <ul ref={ref} className={cn(listVariants({ variant, size, className }))} {...props} />;
List.displayName = 'List';

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  className?: string;
/**
 * ListItem - Individual list item component
 */
const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn('px-4 py-2', className)} {...props} />;
ListItem.displayName = 'ListItem';

/**
 * OrderedList - A numbered list component
 */
const OrderedList = React.forwardRef<HTMLOListElement, Omit<ListProps, 'as'>>(
  ({ className, variant, size, ...props }, ref) => {
    return <ol ref={ref} className={cn(listVariants({ variant, size, className }))} {...props} />;
OrderedList.displayName = 'OrderedList';

interface ListTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
/**
 * ListTitle - A title component for lists
 */
const ListTitle = React.forwardRef<HTMLHeadingElement, ListTitleProps>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={cn('px-4 py-2 text-lg font-medium', className)} {...props} />;
ListTitle.displayName = 'ListTitle';

interface ListEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
/**
 * ListEmpty - A component to display when a list is empty
 */
const ListEmpty = React.forwardRef<HTMLDivElement, ListEmptyProps>(
  ({ className, icon, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
        {...props}
      >
        {icon && <div className="mb-4">{icon}</div>}
        {title && <h4 className="mb-2 text-lg font-medium">{title}</h4>}
        {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
ListEmpty.displayName = 'ListEmpty';

export { List, ListItem, OrderedList, ListTitle, ListEmpty };
