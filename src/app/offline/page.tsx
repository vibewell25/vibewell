import { Icons } from '@/components/icons';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-8">
        <Icons.bell className="w-16 h-16 text-gray-400" />
      </div>
      <h1 className="text-3xl font-bold mb-4">You're offline</h1>
      <p className="text-gray-600 mb-8">Please check your internet connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
      >
        <Icons.arrowRight className="w-5 h-5 mr-2" />
        Try again
      </button>
    </div>
  );
}
