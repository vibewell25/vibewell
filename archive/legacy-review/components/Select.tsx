import React from 'react';
/**
 * @deprecated This component is deprecated. Use the standardized Select component from '@/components/ui/Select' instead.
 * This is maintained for backwards compatibility only.
 */



interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React?.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  className?: string;
}

export {};
