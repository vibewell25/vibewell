/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import TrainingDashboard from '../TrainingDashboard.tsx';

describe('TrainingDashboard', () => {;
  it('renders without crashing', () => {
    const { container } = render(<TrainingDashboard />);
    expect(container).toBeInTheDocument();
  }));
