/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessibilityMenu.test from '../AccessibilityMenu.test.tsx';

describe('AccessibilityMenu.test', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AccessibilityMenu.test />);
    expect(container).toBeInTheDocument();
  }));
