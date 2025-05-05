import React from 'react';
import { BaseInput, BaseInputProps } from '@/components/ui/BaseInput';

interface AccessibleInputProps extends Omit<BaseInputProps, 'helpText'> {
  helperText?: string;
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  required,
  ...props
) => {
  return (
    <BaseInput
      label={label}
      error={error}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      helpText={helperText}
      className={className}
      required={required}
      labelClassName="text-gray-700"
      errorClassName="text-red-600"
      helpTextClassName="text-gray-500"
      wrapperClassName="w-full"
      containerClassName="rounded-md"
      {...props}
    />
export default AccessibleInput;
