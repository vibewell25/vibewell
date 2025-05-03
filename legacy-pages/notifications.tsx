import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type NotificationItem = {
  id: string;
  read: boolean;
  createdAt: string;
  [key: string]: any;
};

const Notifications: NextPage = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetchWithTimeout('/api/notifications');
      const data = await res.json();
      setItems(data?.notifications || []);
    };
    
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    await fetchWithTimeout(`/api/notifications/read/${id}`, { method: 'POST' });
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {items.map(n => (
          <li
            key={n.id}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: n.read ? '#e0e0e0' : '#fff'
            }}
          >
            <p>
              <strong>{new Date(n.createdAt).toLocaleString()}</strong> - {n.read ? 'Read' : 'Unread'}
            </p>
            <pre>{JSON.stringify(n, null, 2)}</pre>
            {!n.read && <button onClick={() => markRead(n.id)}>Mark as read</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
