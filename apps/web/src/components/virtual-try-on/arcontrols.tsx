import { useState } from 'react';
import { CameraOff, ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';

interface ARControlsProps {
  modelId: string;
}

/**
 * Controls for interacting with AR models
 *
 * @component
 * @example
 * ```tsx
 * <ARControls modelId="lipstick-red" />
 * ```
 */
export function ARControls({ modelId }: ARControlsProps) {
  const [inARMode, setInARMode] = useState(false);

  const startARSession = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setInARMode(true);
      // In a real implementation, this would initialize WebXR

      // For demonstration purposes
      alert('AR mode activated! In a real app, this would launch the AR experience.');
    } catch (err) {
      console.error('Error starting AR session:', err);
      setInARMode(false);
    }
  };

  const stopARSession = () => {
    setInARMode(false);
    // In a real implementation, this would end the WebXR session
  };

  const shareModel = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this product in AR',
          text: 'Try this product virtually with Vibewell AR!',
          url: `https://vibewell.com/virtual-try-on/${modelId}`,
        })
        .catch((err) => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `https://vibewell.com/virtual-try-on/${modelId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="ar-controls absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center space-x-4 rounded-full bg-white/80 px-6 py-3 backdrop-blur-sm">
      {!inARMode ? (
        <button
          onClick={startARSession}
          className="bg-primary flex items-center justify-center rounded-full p-3 text-white"
          aria-label="Try in AR"
        >
          <span className="mr-2">Try in AR</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      ) : (
        <button
          onClick={stopARSession}
          className="rounded-full bg-gray-700 p-3 text-white"
          aria-label="Exit AR"
        >
          <span className="mr-2">Exit AR</span>
          <CameraOff size={20} />
        </button>
      )}

      <div className="flex items-center space-x-3">
        <button className="rounded-full bg-gray-200 p-2 hover:bg-gray-300" aria-label="Zoom in">
          <ZoomIn size={18} />
        </button>

        <button className="rounded-full bg-gray-200 p-2 hover:bg-gray-300" aria-label="Zoom out">
          <ZoomOut size={18} />
        </button>

        <button className="rounded-full bg-gray-200 p-2 hover:bg-gray-300" aria-label="Reset view">
          <RotateCcw size={18} />
        </button>

        <button
          onClick={shareModel}
          className="rounded-full bg-gray-200 p-2 hover:bg-gray-300"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ARControls;
