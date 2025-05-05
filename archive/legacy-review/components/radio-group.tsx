import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
export {};
