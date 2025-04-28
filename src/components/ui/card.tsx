import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  BaseCard,
  BaseCardHeader,
  BaseCardFooter,
  BaseCardTitle,
  BaseCardDescription,
  BaseCardContent,
} from './base-card';

const Card = React.forwardRef<HTMLDivElement, BaseCardProps>(({ className, ...props }, ref) => (
  <BaseCard ref={ref} className={cn(className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, BaseCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <BaseCardHeader ref={ref} className={cn(className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, BaseCardTitleProps>(
  ({ className, ...props }, ref) => (
    <BaseCardTitle ref={ref} className={cn(className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, BaseCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <BaseCardDescription ref={ref} className={cn(className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, BaseCardContentProps>(
  ({ className, ...props }, ref) => (
    <BaseCardContent ref={ref} className={cn(className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, BaseCardFooterProps>(
  ({ className, ...props }, ref) => (
    <BaseCardFooter ref={ref} className={cn(className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
