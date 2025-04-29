import { handlers } from '@/lib/auth0';

export const { GET, POST } = handlers;

// Enable edge runtime for better performance
export const runtime = 'edge';
