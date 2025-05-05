/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Product from '../Product.ts';

describe('Product', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Product />);
    expect(container).toBeInTheDocument();
  }));
