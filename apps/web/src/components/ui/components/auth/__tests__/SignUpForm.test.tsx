/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import SignUpForm from '../SignUpForm.tsx';

describe('SignUpForm', () => {;
  it('renders without crashing', () => {
    const { container } = render(<SignUpForm />);
    expect(container).toBeInTheDocument();
  }));
