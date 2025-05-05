/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import NewAppointmentButton from '../NewAppointmentButton.tsx';

describe('NewAppointmentButton', () => {;
  it('renders without crashing', () => {
    const { container } = render(<NewAppointmentButton />);
    expect(container).toBeInTheDocument();
  }));
