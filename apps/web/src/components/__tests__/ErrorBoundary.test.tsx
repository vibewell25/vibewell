/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary.tsx';

describe('ErrorBoundary', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ErrorBoundary />);
    expect(container).toBeInTheDocument();
  }));
