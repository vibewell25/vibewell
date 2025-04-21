import { NextApiRequest, NextApiResponse } from '@/types/api';
import { getAuth } from '@clerk/nextjs/server';
import { BeautyServiceService } from '../../../services/beautyService.service';

const beautyServiceService = new BeautyServiceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const service = await beautyServiceService.createService({
          ...req.body,
          businessId: req.body.businessId,
        });
        return res.status(201).json(service);
      } catch (error) {
        console.error('Error creating beauty service:', error);
        return res.status(500).json({ error: 'Failed to create beauty service' });
      }

    case 'GET':
      try {
        const { businessId } = req.query;

        if (!businessId || typeof businessId !== 'string') {
          return res.status(400).json({ error: 'Business ID is required' });
        }

        const services = await beautyServiceService.getServicesByBusiness(businessId);
        return res.status(200).json(services);
      } catch (error) {
        console.error('Error fetching beauty services:', error);
        return res.status(500).json({ error: 'Failed to fetch beauty services' });
      }

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
