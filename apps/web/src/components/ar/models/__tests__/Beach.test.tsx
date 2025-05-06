/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Beach from '../Beach.tsx';

describe('Beach', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Beach />);
    expect(container).toBeInTheDocument();
  }));
