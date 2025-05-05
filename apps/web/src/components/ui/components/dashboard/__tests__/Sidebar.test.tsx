/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar.tsx';

describe('Sidebar', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Sidebar />);
    expect(container).toBeInTheDocument();
  }));
