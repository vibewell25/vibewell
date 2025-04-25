import { Expo, ExpoPushMessage, ExpoPushReceipt } from 'expo-server-sdk';
import prisma from '../prismaClient';

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notifications to all tokens of a user
 * @param userId ID of the user to notify
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 */
export async function sendUserPushNotifications(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: boolean; receipts?: ExpoPushReceipt[]; error?: string }> {
  // Fetch user push tokens from DB
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const tokens = Array.isArray(user.pushTokens) ? user.pushTokens : [];
  // Build messages
  const messages: ExpoPushMessage[] = [];
  for (const entry of tokens) {
    const token = (entry as any).token;
    if (Expo.isExpoPushToken(token)) {
      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {}
      });
    }
  }

  // Chunk messages
  const chunks = expo.chunkPushNotifications(messages);
  const receipts: ExpoPushReceipt[] = [];
  try {
    for (const chunk of chunks) {
      const chunkReceipts = await expo.sendPushNotificationsAsync(chunk);
      receipts.push(...chunkReceipts);
    }
    return { success: true, receipts };
  } catch (err: any) {
    console.error('Push send error:', err);
    return { success: false, error: err.message };
  }
}
