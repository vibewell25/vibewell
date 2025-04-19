import './globals.css';
import Providers from './providers';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import Auth0Provider from '@/components/auth/Auth0Provider';
import { AuthProvider } from '@/contexts/auth-context';

// Define the font
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'VibeWell Platform',
  description: 'A wellness platform connecting users with providers, offering virtual services, and e-commerce capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={fontSans.className}>
        <Providers defaultLanguage="en" defaultDir="ltr">
          <Auth0Provider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Auth0Provider>
        </Providers>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
