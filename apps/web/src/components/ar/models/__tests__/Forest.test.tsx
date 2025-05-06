/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Forest from '../Forest.tsx';

describe('Forest', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Forest />);
    expect(container).toBeInTheDocument();
  }));
