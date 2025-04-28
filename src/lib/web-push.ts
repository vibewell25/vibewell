import webpush from 'web-push';

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error(
    'VAPID keys are required for web push notifications. Generate them using:',
    '\nnpx web-push generate-vapid-keys',
  );
}

const vapidDetails = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: `mailto:${process.env.VAPID_EMAIL || 'webmaster@vibewell.com'}`,
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

export {};

export async function sendPushNotification(subscription: PushSubscription, payload: any) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
