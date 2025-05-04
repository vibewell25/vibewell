import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  registration: ServiceWorkerRegistration | null;
  isUpdating: boolean;
  error: Error | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    registration: null,
    isUpdating: false,
    error: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    const registerServiceWorker = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        setState((prev) => ({ ...prev, isUpdating: true }));


        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              const shouldUpdate = window.confirm(
                'A new version of the app is available. Would you like to update now?',
              );

              if (shouldUpdate) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        setState((prev) => ({
          ...prev,
          registration,
          isUpdating: false,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error : new Error('Failed to register service worker'),
        }));
      }
    };

    registerServiceWorker();

    // Handle service worker updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    return () => {
      if (state.registration) {
        state.registration.unregister().catch(console.error);
      }
    };
  }, [state.isSupported]);

  const update = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!state.registration) return;

    try {
      setState((prev) => ({ ...prev, isUpdating: true }));
      await state.registration.update();
      setState((prev) => ({ ...prev, isUpdating: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error : new Error('Failed to update service worker'),
      }));
    }
  };

  return {
    ...state,
    update,
  };
}
