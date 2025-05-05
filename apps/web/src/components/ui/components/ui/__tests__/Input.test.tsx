/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from '../Input.tsx';

describe('Input', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Input />);
    expect(container).toBeInTheDocument();
  }));
