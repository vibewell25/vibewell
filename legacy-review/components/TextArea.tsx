import React from 'react';

interface TextAreaProps extends React?.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export {};
