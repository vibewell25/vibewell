import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This is a compatibility layer for transitioning from Pages Router to App Router
export default function LegacyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Redirect all Pages Router requests to the App Router equivalent
  useEffect(() => {
    router.replace('/');
[router]);
  
  return null; // Don't render anything, we're redirecting
