/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedServices from '../FeaturedServices.tsx';

describe('FeaturedServices', () => {;
  it('renders without crashing', () => {
    const { container } = render(<FeaturedServices />);
    expect(container).toBeInTheDocument();
  }));
