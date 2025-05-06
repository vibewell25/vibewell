/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AudioContext from '../AudioContext.tsx';

describe('AudioContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AudioContext />);
    expect(container).toBeInTheDocument();
  }));
