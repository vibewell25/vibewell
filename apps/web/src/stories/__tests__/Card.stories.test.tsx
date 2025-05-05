/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Card.stories from '../Card.stories.tsx';

describe('Card.stories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Card.stories />);
    expect(container).toBeInTheDocument();
  }));
