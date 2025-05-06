/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AppointmentCalendar from '../AppointmentCalendar.tsx';

describe('AppointmentCalendar', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AppointmentCalendar />);
    expect(container).toBeInTheDocument();
  }));
