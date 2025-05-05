/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingSection from '../BookingSection.tsx';

describe('BookingSection', () => {;
  it('renders without crashing', () => {
    const { container } = render(<BookingSection />);
    expect(container).toBeInTheDocument();
  }));
