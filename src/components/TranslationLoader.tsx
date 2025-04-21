import React from 'react';
import { useTranslation } from 'react-i18next';
import { namespaces, fallbackLng } from '@/i18n';

interface TranslationLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({
  children,
  fallback = <DefaultLoadingSpinner />,
}) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load translations for current language
        try {
          await i18n.loadNamespaces(namespaces);
        } catch (e) {
          // If loading fails, try fallback language
          console.warn(
            `Failed to load translations for ${i18n.language}, falling back to ${fallbackLng}`
          );
          await i18n.changeLanguage(fallbackLng);
          await i18n.loadNamespaces(namespaces);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading translations:', error);
        setError(error instanceof Error ? error : new Error('Failed to load translations'));
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [i18n.language]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        <p>Failed to load translations. Using default text.</p>
      </div>
    );
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const DefaultLoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
  </div>
);
