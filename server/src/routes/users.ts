import { Router } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router = Router();

// Register or update push token
router.post('/:userId/push-token', checkJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    const { token, platform, deviceName, deviceModel } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tokens = Array.isArray(user.pushTokens) ? user.pushTokens : [];
    tokens.push({ token, platform, deviceName, deviceModel, registeredAt: new Date().toISOString() });

    await prisma.user.update({
      where: { id: userId },
      data: { pushTokens: tokens }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Push token error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update notification settings
router.put('/:userId/notification-preferences', checkJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: settings }
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Notification settings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get notification settings
router.get('/:userId/notification-preferences', checkJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ settings: user.notificationSettings });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Send notification to user
router.post('/:userId/notify', checkJwt, async (req, res) => {
  try {
    const { title, body, data } = req.body;
    const result = await import('../services/expoPushService').then(m => m.sendUserPushNotifications(req.params.userId, title, body, data));
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json({ success: true, receipts: result.receipts });
  } catch (err) {
    console.error('Send notification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
