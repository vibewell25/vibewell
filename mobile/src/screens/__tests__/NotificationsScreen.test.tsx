import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../NotificationsScreen';
import * as service from '../../services/notificationsApiService';
import { useTheme } from '../../contexts/ThemeContext';

jest?.mock('../../services/notificationsApiService');
jest?.mock('../../contexts/ThemeContext');

describe('NotificationsScreen', () => {
  const mockItems = [
    { id: '1', userId: 'u1', title: 'Hello', message: 'World', read: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
  ];

  beforeEach(() => {
    (service?.getNotifications as jest?.Mock).mockResolvedValue(mockItems);
    (useTheme as jest?.Mock).mockReturnValue({ colors: { background: '#fff', text: '#000', border: '#ccc', primary: '#0f0', notification: '#f00' } });
  });

  it('renders and displays notifications', async () => {
    const { getByText } = render(<NotificationsScreen />);
    await waitFor(() => expect(service?.getNotifications).toHaveBeenCalled());
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('World')).toBeTruthy();
  });
});
