/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AudioControls from '../AudioControls.tsx';

describe('AudioControls', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AudioControls />);
    expect(container).toBeInTheDocument();
  }));
