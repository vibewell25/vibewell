import Link from "next/link";
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const [cachedPages, setCachedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get cached pages from service worker
  useEffect(() => {
    const getCachedPages = async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open('vibewell-pages-cache');
          const keys = await cache.keys();
          const urls = keys
            .map(req => {
              const url = new URL(req.url);
              return url.pathname;
)
            .filter(path => 
              path !== '/' && 
              path !== '/offline' && 
              !path.includes('/_next/') && 
              !path.includes('/api/')
// Remove duplicates without using Set spread
          const uniqueUrls: string[] = [];
          urls.forEach(url => {
            if (!uniqueUrls.includes(url)) {
              uniqueUrls.push(url);
setCachedPages(uniqueUrls);
catch (error) {
        console.error('Failed to get cached pages:', error);
getCachedPages();
[]);

  const handleRefresh = () => {
    setIsLoading(true);
    
    // Check if we're back online
    if (navigator.onLine) {
      window.location.href = '/';
else {
      // If still offline, show the spinner for a bit and then stop
      setTimeout(() => {
        setIsLoading(false);
1500);
return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
      <WifiOff size={64} className="text-muted-foreground mb-6" />
      
      <h1 className="text-4xl font-bold mb-3">You're offline</h1>
      <p className="mb-8 text-muted-foreground max-w-md">
        It seems you're not connected to the internet. Check your connection and try again.
      </p>
      
      <button 
        onClick={handleRefresh} 
        className="mb-8 flex items-center gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-md"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Checking connection...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Refresh connection
          </>
        )}
      </button>
      
      {cachedPages.length > 0 && (
        <div className="mt-8 w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-4">Available offline pages</h2>
          <ul className="space-y-2 text-left border rounded-lg divide-y">
            {cachedPages.map((path) => (
              <li key={path} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Link href={path} className="block w-full">
                  {path.replace(/\//g, ' › ').replace(/^\s›\s/, '')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
