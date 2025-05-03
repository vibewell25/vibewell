import type { DynamicOptionsLoadingProps } from 'next/dynamic';

export function Loading({ error, isLoading, pastDelay }: DynamicOptionsLoadingProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading component: {error?.message}
      </div>
    );
  }

  if (!isLoading || !pastDelay) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
}

export default Loading;
