// This file is used to register a service worker in Next.js

export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
    const wb = window.workbox;
    
    // add event listeners to handle any of PWA lifecycle event
    // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
    wb.addEventListener('installed', event => {
      console.log(`Service Worker installed: ${event.isUpdate ? 'updated' : 'fresh install'}`);
    });

    wb.addEventListener('activated', event => {
      if (!event.isUpdate) {
        // First-installed code goes here
        console.log('Service worker activated for the first time!');
      } else {
        console.log('Service worker has been updated');
      }
    });

    // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
    // NOTE: MUST set skipWaiting to false in next.config.js pwa object
    // Also remember to add a loading state for when the user accepts the updated app
    wb.addEventListener('waiting', event => {
      if (window.confirm('A new version is available. Reload to update?')) {
        wb.addEventListener('controlling', event => {
          window.location.reload();
        });
        wb.messageSkipWaiting();
      }
    });

    // Register the service worker after event listeners have been added
    wb.register()
      .then(registration => console.log('Service Worker registered successfully', registration))
      .catch(error => console.error('Service Worker registration failed', error));
  } else {
    console.warn('Service workers are not supported in this environment');
  }
};

// This is to be used in _app.js or similar entry point
export const initServiceWorker = () => {
  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
  }
};

// For TypeScript support
declare global {
  interface Window {
    workbox: any;
  }
} 