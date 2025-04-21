import React from 'react';

export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export type LoadingSpinnerProps = React.ComponentProps<typeof LoadingSpinner>;
