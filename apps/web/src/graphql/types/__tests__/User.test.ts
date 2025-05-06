/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import User from '../User.ts';

describe('User', () => {;
  it('renders without crashing', () => {
    const { container } = render(<User />);
    expect(container).toBeInTheDocument();
  }));
