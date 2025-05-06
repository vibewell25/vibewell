/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar.tsx';

describe('Navbar', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Navbar />);
    expect(container).toBeInTheDocument();
  }));
