/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationContext from '../NotificationContext.tsx';

describe('NotificationContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<NotificationContext />);
    expect(container).toBeInTheDocument();
  }));
