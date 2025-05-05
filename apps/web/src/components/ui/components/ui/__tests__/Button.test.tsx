/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '../Button.tsx';

describe('Button', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Button />);
    expect(container).toBeInTheDocument();
  }));
