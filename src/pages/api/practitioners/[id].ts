import { NextApiRequest, NextApiResponse } from '@/types/api';
import { getAuth } from '@clerk/nextjs/server';
import { PractitionerService } from '../../../services/practitioner.service';

const practitionerService = new PractitionerService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid practitioner ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const practitioner = await practitionerService.getPractitionerById(id);

        if (!practitioner) {
          return res.status(404).json({ error: 'Practitioner not found' });
        }

        return res.status(200).json(practitioner);
      } catch (error) {
        console.error('Error fetching practitioner:', error);
        return res.status(500).json({ error: 'Failed to fetch practitioner' });
      }

    case 'PUT':
      try {
        const practitioner = await practitionerService.updatePractitioner(id, req.body);
        return res.status(200).json(practitioner);
      } catch (error) {
        console.error('Error updating practitioner:', error);
        return res.status(500).json({ error: 'Failed to update practitioner' });
      }

    case 'DELETE':
      try {
        await practitionerService.deletePractitioner(id);
        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting practitioner:', error);
        return res.status(500).json({ error: 'Failed to delete practitioner' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
