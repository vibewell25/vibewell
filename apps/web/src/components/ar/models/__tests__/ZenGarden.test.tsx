/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ZenGarden from '../ZenGarden.tsx';

describe('ZenGarden', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ZenGarden />);
    expect(container).toBeInTheDocument();
  }));
