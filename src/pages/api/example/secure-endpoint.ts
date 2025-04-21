/**
 * Example of a secure API endpoint using security middleware
 */
import { NextApiRequest, NextApiResponse } from '@/types/api';
import { withSecurity } from '../../../middleware/security';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Secure endpoint logic
    res.status(200).json({ message: 'Secure endpoint accessed successfully' });
  } catch (error) {
    console.error('Error in secure endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply security middleware
export default withSecurity(handler);
