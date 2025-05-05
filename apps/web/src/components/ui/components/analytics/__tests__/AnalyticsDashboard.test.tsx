/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from '../AnalyticsDashboard.tsx';

describe('AnalyticsDashboard', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AnalyticsDashboard />);
    expect(container).toBeInTheDocument();
  }));
