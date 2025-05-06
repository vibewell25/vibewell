/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import LoyaltyProgram from '../LoyaltyProgram.ts';

describe('LoyaltyProgram', () => {;
  it('renders without crashing', () => {
    const { container } = render(<LoyaltyProgram />);
    expect(container).toBeInTheDocument();
  }));
