import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import EmailCampaignsScreen from '../EmailCampaignsScreen';
import * as service from '../../services/emailCampaignService';
import { useTheme } from '../../contexts/ThemeContext';

jest.mock('../../services/emailCampaignService');
jest.mock('../../contexts/ThemeContext');

const mockCampaigns = [
  { id: '1', name: 'Test', subject: 'Subj', body: 'Body', scheduledAt: null, sent: false, createdAt: '2025-01-01', updatedAt: '2025-01-02' },
];

describe('EmailCampaignsScreen', () => {
  beforeEach(() => {
    (service.getEmailCampaigns as jest.Mock).mockResolvedValue(mockCampaigns);
    (useTheme as jest.Mock).mockReturnValue({ colors: { background: '#fff', text: '#000', border: '#ccc', primary: '#0f0', notification: '#f00' } });
  });

  it('renders and displays campaigns', async () => {
    const { getByText } = render(<EmailCampaignsScreen />);
    await waitFor(() => expect(service.getEmailCampaigns).toHaveBeenCalled());
    expect(getByText('Test')).toBeTruthy();
    expect(getByText('Subj')).toBeTruthy();
  });
});
