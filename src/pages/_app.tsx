import type { AppProps } from 'next/app';
import { ChatProvider } from '@/contexts/ChatContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <Component {...pageProps} />
    </ChatProvider>
  );
}
