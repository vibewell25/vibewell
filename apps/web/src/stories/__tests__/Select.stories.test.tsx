/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Select.stories from '../Select.stories.tsx';

describe('Select.stories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Select.stories />);
    expect(container).toBeInTheDocument();
  }));
