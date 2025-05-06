/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ParticleSystem from '../ParticleSystem.tsx';

describe('ParticleSystem', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ParticleSystem />);
    expect(container).toBeInTheDocument();
  }));
