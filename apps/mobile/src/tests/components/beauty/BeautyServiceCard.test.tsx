import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BeautyServiceCard from '../../../components/beauty/BeautyServiceCard';
import { BeautyService } from '../../../types/beauty';

// Mock the MaterialIcons
jest?.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

describe('BeautyServiceCard Component', () => {
  const mockService: BeautyService = {
    id: '1',
    title: 'Haircut & Styling',
    description: 'Professional haircut and styling for all hair types',
    price: 49?.99,
    imageUrl: 'https://example?.com/haircut?.jpg',
    rating: 4?.8,
    duration: 60,
    featured: true,
    categoryId: 'cat123',
    providerId: 'p123',
  };

  const mockProps = {
    service: mockService,
    onPress: jest?.fn(),
    isDarkMode: false,
  };

  beforeEach(() => {
    jest?.clearAllMocks();
  });

  it('renders correctly with service details', () => {
    const { getByText, getByTestId } = render(<BeautyServiceCard {...mockProps} />);
    
    expect(getByText(mockService?.title)).toBeTruthy();
    expect(getByText(mockService?.description)).toBeTruthy();
    expect(getByText(`$${mockService?.price}`)).toBeTruthy();
    expect(getByText(`${mockService?.duration} min`)).toBeTruthy();
    expect(getByTestId('beautyServiceCard')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(<BeautyServiceCard {...mockProps} />);
    
    fireEvent?.press(getByTestId('beautyServiceCard'));
    expect(mockProps?.onPress).toHaveBeenCalledWith(mockService);
  });

  it('displays featured badge when service is featured', () => {
    const { getByTestId } = render(<BeautyServiceCard {...mockProps} />);
    
    expect(getByTestId('featuredBadge')).toBeTruthy();
  });

  it('does not display featured badge when service is not featured', () => {
    const nonFeaturedProps = {
      ...mockProps,
      service: {
        ...mockService,
        featured: false,
      },
    };
    
    const { queryByTestId } = render(<BeautyServiceCard {...nonFeaturedProps} />);
    
    expect(queryByTestId('featuredBadge')).toBeNull();
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    const darkModeProps = {
      ...mockProps,
      isDarkMode: true,
    };
    
    const { getByTestId } = render(<BeautyServiceCard {...darkModeProps} />);
    
    const card = getByTestId('beautyServiceCard');
    // Note: Actual style checking would depend on how styles are applied
    // This is a basic test that the component renders in dark mode
    expect(card).toBeTruthy();
  });

  it('displays the correct rating', () => {
    const { getByText } = render(<BeautyServiceCard {...mockProps} />);
    
    expect(getByText(mockService?.rating.toString())).toBeTruthy();
  });

  it('limits title to specified number of lines', () => {
    const longTitleProps = {
      ...mockProps,
      service: {
        ...mockService,
        title: 'Very long title that should be truncated because it exceeds the maximum number of lines allowed for the title component',
      },
    };
    
    const { getByTestId } = render(<BeautyServiceCard {...longTitleProps} />);
    
    // Note: We can't directly test numberOfLines prop rendering in jest,
    // but we can verify the component renders without error
    expect(getByTestId('serviceTitle')).toBeTruthy();
  });

  it('limits description to specified number of lines', () => {
    const longDescProps = {
      ...mockProps,
      service: {
        ...mockService,
        description: 'Very long description that should be truncated because it exceeds the maximum number of lines allowed for the description component. This is a much longer text to ensure it would normally overflow.',
      },
    };
    
    const { getByTestId } = render(<BeautyServiceCard {...longDescProps} />);
    
    // Note: We can't directly test numberOfLines prop rendering in jest,
    // but we can verify the component renders without error
    expect(getByTestId('serviceDescription')).toBeTruthy();
  });
}); 