/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AppointmentsList from '../AppointmentsList.tsx';

describe('AppointmentsList', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AppointmentsList />);
    expect(container).toBeInTheDocument();
  }));
