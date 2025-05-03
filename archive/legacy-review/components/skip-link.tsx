import { cn } from '@/lib/utils';

interface SkipLinkProps {
  contentId?: string;
  className?: string;
  label?: string;
}

/**
 * SkipLink component provides a way for keyboard users to bypass navigation
 * and skip directly to the main content of the page.
 *
 * It's visually hidden by default but becomes visible when focused,
 * allowing keyboard users to tab to it and press Enter to skip to the main content.
 */
export function SkipLink({
  contentId = 'main-content',
  className,
  label = 'Skip to content',
}: SkipLinkProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-4 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        className,
      )}
    >
      {label}
    </a>
  );
}

export default SkipLink;
