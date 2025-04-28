import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PromotionsScreen from '../PromotionsScreen';
import * as service from '../../services/promotionService';
import { useTheme } from '../../contexts/ThemeContext';

jest.mock('../../services/promotionService');
jest.mock('../../contexts/ThemeContext');

const mockCodes = [
  { id: '1', code: 'SAVE10', description: 'Desc', discount: 10, validFrom: '', validTo: '' },
];

describe('PromotionsScreen', () => {
  beforeEach(() => {
    (service.getPromotionCodes as jest.Mock).mockResolvedValue(mockCodes);
    (useTheme as jest.Mock).mockReturnValue({ colors: { background: '#fff', text: '#000', border: '#ccc', primary: '#0f0', notification: '#f00' } });
  });

  it('renders and displays codes', async () => {
    const { getByText } = render(<PromotionsScreen />);
    await waitFor(() => expect(service.getPromotionCodes).toHaveBeenCalled());
    expect(getByText('SAVE10 - 10%')).toBeTruthy();
  });
});
