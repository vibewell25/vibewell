/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientPreferences from '../ClientPreferences.ts';

describe('ClientPreferences', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ClientPreferences />);
    expect(container).toBeInTheDocument();
  }));
