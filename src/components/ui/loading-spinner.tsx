import React from 'react';

export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export type LoadingSpinnerProps = React.ComponentProps<typeof LoadingSpinner>;
