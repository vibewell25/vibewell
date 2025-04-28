import { Loader2, Camera, Sparkles } from 'lucide-react';

interface Props {
  type?: 'default' | 'camera' | 'processing';
  message?: string;
  progress?: number;
}

export function LoadingIndicator({ type = 'default', message = 'Loading...', progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative mb-4">
        {type === 'camera' ? (
          <Camera className="h-8 w-8 animate-pulse text-pink-500" />
        ) : type === 'processing' ? (
          <Sparkles className="h-8 w-8 animate-spin text-pink-500" />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        )}

        {progress !== undefined && (
          <div className="absolute -bottom-4 left-1/2 w-12 -translate-x-1/2 transform">
            <div className="h-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-600">{message}</div>

      {type === 'camera' && (
        <div className="mt-2 text-xs text-gray-500">Please allow camera access when prompted</div>
      )}

      {type === 'processing' && progress !== undefined && (
        <div className="mt-2 text-xs text-gray-500">{progress}% complete</div>
      )}
    </div>
  );
}
