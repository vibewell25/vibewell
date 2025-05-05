/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import TrainingAnalytics from '../TrainingAnalytics.tsx';

describe('TrainingAnalytics', () => {;
  it('renders without crashing', () => {
    const { container } = render(<TrainingAnalytics />);
    expect(container).toBeInTheDocument();
  }));
