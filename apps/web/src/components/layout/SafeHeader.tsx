import { withErrorBoundary } from '@/hooks/useErrorBoundary';
import { Header } from './Header';

/**
 * A version of the Header component wrapped with an error boundary
 * to gracefully handle any errors that might occur during rendering.
 */
export const SafeHeader = withErrorBoundary<HeaderProps>(Header, {
  fallback: (
    <header className="border-b border-border bg-background py-4">
      <div className="container-app mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <span className="text-primary text-2xl font-bold">Vibewell</span>
          </a>
        </div>
        <div>
          {/* Fallback content */}
          <span className="text-muted-foreground">Menu unavailable</span>
        </div>
      </div>
    </header>
  ),
  onError: (error) => {
    // You could send this error to your monitoring service (e.g. Sentry, LogRocket)
    console.error('Header component error:', error);
export default SafeHeader;
