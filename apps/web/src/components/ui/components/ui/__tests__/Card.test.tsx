/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card.tsx';

describe('Card', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Card />);
    expect(container).toBeInTheDocument();
  }));
