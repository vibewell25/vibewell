/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../Hero.tsx';

describe('Hero', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Hero />);
    expect(container).toBeInTheDocument();
  }));
