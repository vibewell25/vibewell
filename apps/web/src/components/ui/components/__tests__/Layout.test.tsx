/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout.tsx';

describe('Layout', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Layout />);
    expect(container).toBeInTheDocument();
  }));
