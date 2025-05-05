/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Mountain from '../Mountain.tsx';

describe('Mountain', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Mountain />);
    expect(container).toBeInTheDocument();
  }));
