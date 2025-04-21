import { NextApiRequest, NextApiResponse } from '@/types/api';
import { getAuth } from '@clerk/nextjs/server';
import { BeautyServiceService } from '../../../services/beautyService.service';

const beautyServiceService = new BeautyServiceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const service = await beautyServiceService.getServiceById(id);

        if (!service) {
          return res.status(404).json({ error: 'Service not found' });
        }

        return res.status(200).json(service);
      } catch (error) {
        console.error('Error fetching beauty service:', error);
        return res.status(500).json({ error: 'Failed to fetch beauty service' });
      }

    case 'PUT':
      try {
        const service = await beautyServiceService.updateService(id, req.body);
        return res.status(200).json(service);
      } catch (error) {
        console.error('Error updating beauty service:', error);
        return res.status(500).json({ error: 'Failed to update beauty service' });
      }

    case 'DELETE':
      try {
        await beautyServiceService.deleteService(id);
        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting beauty service:', error);
        return res.status(500).json({ error: 'Failed to delete beauty service' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
