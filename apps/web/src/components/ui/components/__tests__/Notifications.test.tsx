/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from '../Notifications.tsx';

describe('Notifications', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Notifications />);
    expect(container).toBeInTheDocument();
  }));
