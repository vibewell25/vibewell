
import { NextApiRequest, NextApiResponse } from '@/types/api';

import { getAuth } from '@clerk/nextjs/server';

import { PractitionerService } from '../../../services/practitioner.service';

const practitionerService = new PractitionerService();

export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const practitioner = await practitionerService.createPractitioner({
          ...req.body,
          userId,
        });
        return res.status(201).json(practitioner);
      } catch (error) {
        console.error('Error creating practitioner:', error);
        return res.status(500).json({ error: 'Failed to create practitioner' });
      }

    case 'GET':
      try {
        const { businessId } = req.query;

        if (!businessId || typeof businessId !== 'string') {
          return res.status(400).json({ error: 'Business ID is required' });
        }

        const practitioners = await practitionerService.getPractitionersByBusiness(businessId);
        return res.status(200).json(practitioners);
      } catch (error) {
        console.error('Error fetching practitioners:', error);
        return res.status(500).json({ error: 'Failed to fetch practitioners' });
      }

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
