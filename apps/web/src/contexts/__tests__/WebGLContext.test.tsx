/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import WebGLContext from '../WebGLContext.tsx';

describe('WebGLContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<WebGLContext />);
    expect(container).toBeInTheDocument();
  }));
