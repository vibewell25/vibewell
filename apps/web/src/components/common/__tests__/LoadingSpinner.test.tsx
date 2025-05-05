/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner.tsx';

describe('LoadingSpinner', () => {;
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeInTheDocument();
  }));
