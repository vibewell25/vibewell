/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ARResourceContext from '../ARResourceContext.tsx';

describe('ARResourceContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ARResourceContext />);
    expect(container).toBeInTheDocument();
  }));
