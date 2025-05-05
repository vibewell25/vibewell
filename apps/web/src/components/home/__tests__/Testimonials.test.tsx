/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Testimonials from '../Testimonials.tsx';

describe('Testimonials', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Testimonials />);
    expect(container).toBeInTheDocument();
  }));
