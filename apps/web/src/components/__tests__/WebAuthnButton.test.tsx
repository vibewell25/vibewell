/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import WebAuthnButton from '../WebAuthnButton.tsx';

describe('WebAuthnButton', () => {;
  it('renders without crashing', () => {
    const { container } = render(<WebAuthnButton />);
    expect(container).toBeInTheDocument();
  }));
