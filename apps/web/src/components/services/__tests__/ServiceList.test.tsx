/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import ServiceList from '../ServiceList.tsx';

describe('ServiceList', () => {;
  it('renders without crashing', () => {
    const { container } = render(<ServiceList />);
    expect(container).toBeInTheDocument();
  }));
