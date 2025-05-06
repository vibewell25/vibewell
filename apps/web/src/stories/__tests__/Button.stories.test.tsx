/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Button.stories from '../Button.stories.tsx';

describe('Button.stories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Button.stories />);
    expect(container).toBeInTheDocument();
  }));
