"use client";

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

interface IntercomFunction extends Function {
  c?: (args: unknown) => void;
  q?: unknown[];
}

export default function LiveChat() {
  const { user } = useUser();

  useEffect(() => {
    // Initialize Intercom
    const initIntercom = () => {
      window.intercomSettings = {
        app_id: process.env['NEXT_PUBLIC_INTERCOM_APP_ID'],
        name: user?.name,
        email: user?.email,
        created_at: user?.createdAt,
      };

      (function() {
        const w = window;
        const ic = w.Intercom;
        if (typeof ic === "function") {
          ic('reattach_activator');
          ic('update', w.intercomSettings);
        } else {
          const d = document;
          const i: IntercomFunction = function() {
            if (i.c) i.c(arguments);
          };
          i.q = [];
          i.c = function(args) {
            if (i.q) i.q.push(args);
          };
          w.Intercom = i;

          const l = function() {
            const s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://widget.intercom.io/widget/' + process.env['NEXT_PUBLIC_INTERCOM_APP_ID'];
            const x = d.getElementsByTagName('script')[0];
            if (x && x.parentNode) {
              x.parentNode.insertBefore(s, x);
            }
          };

          if (document.readyState === 'complete') {
            l();
          } else {
            w.addEventListener('load', l, false);
          }
        }
      })();
    };

    if (user) {
      initIntercom();
    }

    return () => {
      // Cleanup Intercom on unmount
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, [user]);

  return null; // Intercom widget is injected directly into the DOM
}
