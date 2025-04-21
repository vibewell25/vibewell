import type { AppProps } from 'next/app';
import { AppProviders } from '../providers/app-providers';
import '../styles/globals.css';
import '../styles/accessibility.css';
import '../styles/rtl-support.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}

export default MyApp; 