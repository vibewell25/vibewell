/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ARContext from '../ARContext.tsx';

describe('ARContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ARContext />);
    expect(container).toBeInTheDocument();
  }));
