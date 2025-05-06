/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingFlow from '../BookingFlow.tsx';

describe('BookingFlow', () => {;
  it('renders without crashing', () => {
    const { container } = render(<BookingFlow />);
    expect(container).toBeInTheDocument();
  }));
