/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationBell from '../NotificationBell.tsx';

describe('NotificationBell', () => {;
  it('renders without crashing', () => {
    const { container } = render(<NotificationBell />);
    expect(container).toBeInTheDocument();
  }));
