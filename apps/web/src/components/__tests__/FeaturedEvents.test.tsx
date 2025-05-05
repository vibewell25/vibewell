/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedEvents from '../FeaturedEvents.tsx';

describe('FeaturedEvents', () => {;
  it('renders without crashing', () => {
    const { container } = render(<FeaturedEvents />);
    expect(container).toBeInTheDocument();
  }));
