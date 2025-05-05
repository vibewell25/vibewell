/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ARViewerLazy from '../ARViewerLazy.tsx';

describe('ARViewerLazy', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ARViewerLazy />);
    expect(container).toBeInTheDocument();
  }));
