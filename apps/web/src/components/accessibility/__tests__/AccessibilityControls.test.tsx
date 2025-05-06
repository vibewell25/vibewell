/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessibilityControls from '../AccessibilityControls.tsx';

describe('AccessibilityControls', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AccessibilityControls />);
    expect(container).toBeInTheDocument();
  }));
