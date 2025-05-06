/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageContext from '../MessageContext.tsx';

describe('MessageContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<MessageContext />);
    expect(container).toBeInTheDocument();
  }));
