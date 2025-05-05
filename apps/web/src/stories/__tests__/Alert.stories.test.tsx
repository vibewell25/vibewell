/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Alert.stories from '../Alert.stories.tsx';

describe('Alert.stories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Alert.stories />);
    expect(container).toBeInTheDocument();
  }));
