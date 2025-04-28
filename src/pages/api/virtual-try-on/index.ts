import { NextApiRequest, NextApiResponse } from '@/types/api';
import { getAuth } from '@clerk/nextjs/server';
import { VirtualTryOnService } from '../../../services/virtualTryOn.service';

const tryOnService = new VirtualTryOnService();

export {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { image, serviceId } = req.body;

        if (!image) {
          return res.status(400).json({ error: 'Image is required' });
        }

        const tryOn = await tryOnService.createTryOn({
          userId,
          serviceId,
          image,
        });

        return res.status(201).json(tryOn);
      } catch (error) {
        console.error('Error creating virtual try-on:', error);
        return res.status(500).json({ error: 'Failed to create virtual try-on' });
      }

    case 'GET':
      try {
        const tryOns = await tryOnService.getUserTryOns(userId);
        return res.status(200).json(tryOns);
      } catch (error) {
        console.error('Error fetching try-ons:', error);
        return res.status(500).json({ error: 'Failed to fetch try-ons' });
      }

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
