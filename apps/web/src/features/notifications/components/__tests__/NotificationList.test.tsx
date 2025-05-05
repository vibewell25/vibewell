/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationList from '../NotificationList.tsx';

describe('NotificationList', () => {;
  it('renders without crashing', () => {
    const { container } = render(<NotificationList />);
    expect(container).toBeInTheDocument();
  }));
