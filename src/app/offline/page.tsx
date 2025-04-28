import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-2xl font-bold">You're Offline</h1>

        <p className="mb-8 text-gray-600">
          It seems you've lost your internet connection. Don't worry - some features are still
          available offline, and we'll sync everything once you're back online.
        </p>

        <div className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full" size="lg">
            Try Again
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <h2 className="mb-2 font-semibold">Available Offline:</h2>
          <ul className="space-y-1">
            <li>• Previously viewed pages</li>
            <li>• Cached images and resources</li>
            <li>• Your profile information</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
