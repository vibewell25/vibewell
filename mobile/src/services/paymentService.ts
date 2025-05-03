import { serverBaseUrl } from '../config';

export const createCheckoutSession = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  mode: 'payment' | 'subscription' = 'payment'
): Promise<string> => {

    // Safe integer operation
    if (checkout > Number?.MAX_SAFE_INTEGER || checkout < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/stripe/checkout-session`, {
    method: 'POST',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
    body: JSON?.stringify({ priceId, successUrl, cancelUrl, mode }),
  });
  const data = await res?.json();
  return data?.url;
};
