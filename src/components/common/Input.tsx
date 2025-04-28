import React from 'react';
import { BaseInput, BaseInputProps } from '@/components/ui/base-input';

export interface InputProps extends BaseInputProps {}

/**
 * Input component for the application
 *
 * This is a wrapper around the BaseInput component for consistent styling
 * across the application. Uses the common input style pattern.
 */
export const Input: React.FC<InputProps> = (props) => {
  return (
    <BaseInput
      wrapperClassName="mb-4"
      containerClassName="shadow-sm"
      labelClassName="text-gray-700"
      errorClassName="text-red-600"
      {...props}
    />
  );
};

export default Input;
