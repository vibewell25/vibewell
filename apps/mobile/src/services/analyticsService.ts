import { serverBaseUrl } from '../config';

export const trackEvent = async (event: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  try {

    fetch(`${serverBaseUrl}/api/analytics/track`, {
      method: 'POST',

    
          headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    });
  } catch (err) {
    console.error('Analytics track error:', err);
  }
};
