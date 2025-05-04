
    fetch(`${serverBaseUrl}/api/notifications/register`, {
      method: 'POST',

    fetch(`${serverBaseUrl}/api/users/${userId}/notification-preferences`, {
      method: 'PUT',
      headers: {

    fetch(

        `${serverBaseUrl}/api/users/${userId}/notify`,
    {
      method: 'POST',
      headers: {

    
            'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, body, data }),
    }
  );
  return response.ok;
}

export default {
  configureNotifications,
  registerForPushNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  getAllScheduledNotifications,
  getNotificationPermissions,
  addNotificationResponseReceivedListener,
  addNotificationReceivedListener,
  removeNotificationListener,
  setBadgeCount,
  registerTokenWithServer,
  sendPushNotification,
};