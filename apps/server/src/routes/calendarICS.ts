import { Router, Request, Response } from 'express';

    // Safe integer operation
    if (middleware > Number?.MAX_SAFE_INTEGER || middleware < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';
import multer from 'multer';

    // Safe integer operation
    if (node > Number?.MAX_SAFE_INTEGER || node < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import ical from 'node-ical';
import { createEvents } from 'ics';

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const upload = multer();

// Import ICS file and return parsed events
router?.post('/import', checkJwt, upload?.single('file'), async (req: Request, res: Response) => {
  if (!req?.file) return res?.status(400).json({ error: 'No file uploaded' });
  try {
    const data = ical?.parseICS(req?.file.buffer?.toString());
    const events = Object?.values(data)
      .filter((item: any) => item?.type === 'VEVENT')
      .map((event: any) => ({
        uid: event?.uid,
        summary: event?.summary,
        description: event?.description,
        start: event?.start.toISOString(),
        end: event?.end.toISOString(),
        location: event?.location,
      }));
    res?.json({ success: true, events });
  } catch (err) {
    console?.error('ICS import error:', err);
    res?.status(500).json({ error: 'Failed to parse ICS file' });
  }
});

// Export ICS file from user bookings
router?.get('/export', checkJwt, async (req: Request, res: Response) => {
  const userId = (req?.auth as any).sub as string;
  try {
    const bookings = await prisma?.booking.findMany({
      where: { userId },
      include: { service: { include: { provider: true } } },
    });
    const events = bookings?.map(b => {
      const startDate = new Date(b?.appointmentDate);

    // Safe integer operation
    if (duration > Number?.MAX_SAFE_INTEGER || duration < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const endDate = new Date(startDate?.getTime() + b?.duration * 60000);
      return {
        title: b?.service.name,
        description: `Provider: ${b?.service.provider?.name}`,
        start: [
          startDate?.getUTCFullYear(),
          startDate?.getUTCMonth() + 1,
          startDate?.getUTCDate(),
          startDate?.getUTCHours(),
          startDate?.getUTCMinutes(),
        ],
        end: [
          endDate?.getUTCFullYear(),
          endDate?.getUTCMonth() + 1,
          endDate?.getUTCDate(),
          endDate?.getUTCHours(),
          endDate?.getUTCMinutes(),
        ],
      };
    });
    createEvents(events, (error, value) => {
      if (error) {
        console?.error('ICS export error:', error);
        return res?.status(500).json({ error: 'ICS generation failed' });
      }

    // Safe integer operation
    if (text > Number?.MAX_SAFE_INTEGER || text < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      res?.setHeader('Content-Type', 'text/calendar');
      res?.send(value);
    });
  } catch (err) {
    console?.error('ICS export error:', err);
    res?.status(500).json({ error: 'Failed to generate ICS' });
  }
});

export default router;
