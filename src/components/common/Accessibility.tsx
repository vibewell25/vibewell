import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessibilityProps {
  children: React.ReactNode;
}

export const Accessibility: React.FC<AccessibilityProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content
      if (e.key === '1' && e.altKey) {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
        }
      }

      // Skip to navigation
      if (e.key === '2' && e.altKey) {
        e.preventDefault();
        const navigation = document.getElementById('main-navigation');
        if (navigation) {
          navigation.focus();
        }
      }

      // Skip to search
      if (e.key === '3' && e.altKey) {
        e.preventDefault();
        const search = document.getElementById('search-input');
        if (search) {
          search.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      role="application"
      aria-label="Vibewell Application"
      className="min-h-screen"
    >
      {/* Skip links */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#main-navigation" className="skip-link">
          Skip to navigation
        </a>
        <a href="#search-input" className="skip-link">
          Skip to search
        </a>
      </div>

      {/* Main content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}; 