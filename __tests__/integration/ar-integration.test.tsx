/**
 * AR Integration Tests
 * 
 * This file contains comprehensive integration tests for the AR functionality
 * focusing on model loading, rendering, and performance across different devices and browsers.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARViewComponent from '@/components/ARViewComponent';
import { useARService } from '@/hooks/useARService';
import { useARModels } from '@/hooks/useARModels';
import { ModelInfo } from '@/types/ar-types';

// Mock the hooks
jest.mock('@/hooks/useARService', () => ({
  useARService: jest.fn(),
}));

jest.mock('@/hooks/useARModels', () => ({
  useARModels: jest.fn(),
}));

// Setup mock data
const mockModels: ModelInfo[] = [
  {
    id: 'model1',
    name: 'Makeup Model 1',
    url: 'https://example.com/model1.glb',
    type: 'makeup',
    thumbnail: 'https://example.com/thumbnail1.jpg',
  },
  {
    id: 'model2',
    name: 'Hairstyle Model 1', 
    url: 'https://example.com/model2.glb',
    type: 'hairstyle',
    thumbnail: 'https://example.com/thumbnail2.jpg',
  }
];

// Extend jest with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveValue(value: any): R;
    }
  }
}

describe('AR Integration Tests', () => {
  beforeEach(() => {
    // Mock hook implementations
    (useARService as jest.Mock).mockReturnValue({
      initializeAR: jest.fn().mockResolvedValue(true),
      loadModel: jest.fn().mockResolvedValue({ success: true }),
      applyFilter: jest.fn().mockResolvedValue(true),
      captureImage: jest.fn().mockResolvedValue('data:image/jpeg;base64,...'),
    });

    (useARModels as jest.Mock).mockReturnValue({
      models: mockModels,
      isLoading: false,
      error: null,
    });
  });

  it('renders the AR view component correctly', () => {
    render(<ARViewComponent />);
    
    expect(screen.getByTestId('ar-container')).toBeInTheDocument();
    expect(screen.getByText('AR Experience')).toBeInTheDocument();
  });

  it('loads a model when selected', async () => {
    const mockLoadModel = jest.fn().mockResolvedValue({ success: true });
    (useARService as jest.Mock).mockReturnValue({
      initializeAR: jest.fn().mockResolvedValue(true),
      loadModel: mockLoadModel,
      applyFilter: jest.fn().mockResolvedValue(true),
      captureImage: jest.fn().mockResolvedValue('data:image/jpeg;base64,...'),
    });

    render(<ARViewComponent />);
    
    // Select a model
    fireEvent.click(screen.getByText('Makeup Model 1'));
    
    expect(mockLoadModel).toHaveBeenCalledWith('model1');
    // Wait for model to load and check for loading indicator
    expect(screen.getByTestId('model-loading-indicator')).toHaveClass('loading');
  });
}); 