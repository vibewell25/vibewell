import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  footer?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
}

/**
 * AnalyticsCard - A standardized card component for displaying analytics metrics
 * 
 * This is part of the component composition refactoring effort to create more
 * reusable and consistent UI components across the application.
 */
export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  footer,
  className,
  valueClassName,
  onClick,
}: AnalyticsCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200", 
        onClick && "cursor-pointer hover:shadow-md", 
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="opacity-70">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>
          {value}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        
        {trend && (
          <div className={cn(
            "text-xs font-medium flex items-center mt-2",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span className="mr-1">
              {trend.isPositive ? "↑" : "↓"}
            </span>
            <span>
              {trend.value}% from previous period
            </span>
          </div>
        )}
        
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 