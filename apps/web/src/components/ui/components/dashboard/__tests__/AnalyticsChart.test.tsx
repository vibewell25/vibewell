/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsChart from '../AnalyticsChart.tsx';

describe('AnalyticsChart', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AnalyticsChart />);
    expect(container).toBeInTheDocument();
  }));
