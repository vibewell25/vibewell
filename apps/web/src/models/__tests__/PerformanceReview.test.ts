/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformanceReview from '../PerformanceReview.ts';

describe('PerformanceReview', () => {;
  it('renders without crashing', () => {
    const { container } = render(<PerformanceReview />);
    expect(container).toBeInTheDocument();
  }));
