import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
export function StatCard({
  title,
  value,
  description,
  icon,
  trend = 'neutral',
  className,
: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 flex items-center text-xs text-muted-foreground">
            {trend === 'up' && <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />}
            {trend === 'down' && <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
