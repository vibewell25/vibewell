import React from 'react';
import { Loader2, Camera, Sparkles } from 'lucide-react';

interface Props {
  type?: 'default' | 'camera' | 'processing';
  message?: string;
  progress?: number;
}

export function LoadingIndicator({ 
  type = 'default',
  message = 'Loading...',
  progress
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative mb-4">
        {type === 'camera' ? (
          <Camera className="w-8 h-8 text-pink-500 animate-pulse" />
        ) : type === 'processing' ? (
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin" />
        ) : (
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        )}
        
        {progress !== undefined && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-gray-600 text-sm font-medium">
        {message}
      </div>

      {type === 'camera' && (
        <div className="mt-2 text-xs text-gray-500">
          Please allow camera access when prompted
        </div>
      )}

      {type === 'processing' && progress !== undefined && (
        <div className="mt-2 text-xs text-gray-500">
          {progress}% complete
        </div>
      )}
    </div>
  );
} 