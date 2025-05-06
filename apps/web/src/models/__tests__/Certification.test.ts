/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Certification from '../Certification.ts';

describe('Certification', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Certification />);
    expect(container).toBeInTheDocument();
  }));
