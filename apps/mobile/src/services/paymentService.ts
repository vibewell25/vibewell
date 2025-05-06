import { serverBaseUrl } from '../config';

export const createCheckoutSession = async (priceId: string,
  successUrl: string,
  cancelUrl: string,
  mode: 'payment' | 'subscription' = 'payment'
): Promise<string> => {

    fetch(`${serverBaseUrl}/api/stripe/checkout-session`, {
    method: 'POST',

    
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, successUrl, cancelUrl, mode }),
const data = await res.json();
  return data.url;
