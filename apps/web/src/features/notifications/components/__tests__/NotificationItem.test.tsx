/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationItem from '../NotificationItem.tsx';

describe('NotificationItem', () => {;
  it('renders without crashing', () => {
    const { container } = render(<NotificationItem />);
    expect(container).toBeInTheDocument();
  }));
