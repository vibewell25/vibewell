/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import SignInForm from '../SignInForm.tsx';

describe('SignInForm', () => {;
  it('renders without crashing', () => {
    const { container } = render(<SignInForm />);
    expect(container).toBeInTheDocument();
  }));
